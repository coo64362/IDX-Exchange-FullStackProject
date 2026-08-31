const express = require("express");
const pool = require("../config/db");

const router = express.Router();

const allowedSortColumns = [
    'L_SystemPrice',
    'ListingContractDate',
    'LM_Int2_3',
    'L_Keyword2'
];

const allowedSortOrder = [
    'asc',
    'desc'
];


router.get('/', async (req, res) => {
    const limit = Number.parseInt(req.query.limit ?? "20", 10);
    const offset = Number.parseInt(req.query.offset ?? "0", 10);

    const {
        city,
        zipcode,
        minPrice,
        maxPrice,
        beds,
        baths,
        sortBy,
        sortOrder,
    } = req.query;

    // Validate pagination rules
    if (!Number.isInteger(limit) || !Number.isInteger(offset) || limit < 1 || limit > 100 || offset < 0) { 
        return res.status(400).json({
            error: "The limit must be between 1 and 100, and the offset must be a non-negative integer",
        });
    }

    // Convert numeric filter values only when they were provided.
    const parsedMinPrice = minPrice !== undefined? Number.parseFloat(minPrice) : undefined;

    const parsedMaxPrice = maxPrice !== undefined? Number.parseFloat(maxPrice) : undefined;

    const parsedBeds = beds !== undefined? Number.parseInt(beds, 10) : undefined;

    const parsedBaths = baths !== undefined? Number.parseFloat(baths) : undefined;  
    
    //Validate numeric filters
    if (
        (parsedMinPrice !== undefined && (!Number.isFinite(parsedMinPrice) || parsedMinPrice < 0)) ||
        (parsedMaxPrice !== undefined && (!Number.isFinite(parsedMaxPrice) || parsedMaxPrice < 0)) ||
        (parsedBeds !== undefined && (!Number.isInteger(parsedBeds) || parsedBeds < 0)) || //IsInteger because beds are not decimal
        (parsedBaths!== undefined && (!Number.isFinite(parsedBaths) || parsedBaths < 0))
    
    ) {
        return res.status(400).json({
            error: 
            "minPrice, MaxPrice, beds, and baths must be valid non-negative numbers. Beds should be an integer.",
        })
    }

    // Check to make sure the minimum price is less than the maximum price
    if (
        parsedMinPrice !== undefined &&
        parsedMaxPrice !== undefined &&
        parsedMinPrice > parsedMaxPrice
    ) {
        return res.status(400).json({
            error: "The minPrice must not be greater than the maxPrice",
        });
    }

    // Check to make sure sortBy is a permitted column
    if (
        sortBy !== undefined && !allowedSortColumns.includes(sortBy)
    ) {
        return res.status(400).json({
            error: "Invalid sort option",
            message: "You can sort by price, date listed, square footage, and beds only",
        });
    }

    // Check to make sure sortOrder is valid
    if (
        sortOrder !== undefined &&
        !allowedSortOrder.includes(sortOrder.toLowerCase())
    ) {
        return res.status(400).json({
            error: "Invalid: please sort by ascending or descending",
        });
    }

    // Determine the value to ORDER BY
    let orderBy = 'L_ListingID';
    if (sortBy !== undefined ) {
        if (sortOrder !== undefined) {
            orderBy = sortBy + " " + sortOrder.toUpperCase();
        } else {
            orderBy = sortBy + " " + "ASC";
        }
    }

    const conditions = [];
    const values = [];

    if (city !== undefined && city.trim() !== "") {
        conditions.push("LOWER(TRIM(L_City)) = LOWER(TRIM(?))");
        values.push(city);
    }

    if (zipcode !== undefined && zipcode.trim() !== "") {
        conditions.push("TRIM(L_Zip) = TRIM(?)");
        values.push(zipcode);
    }

    if (parsedMinPrice !== undefined) {
        conditions.push("L_SystemPrice >= ?");
        values.push(parsedMinPrice);
    }

    if (parsedMaxPrice !== undefined) {
        conditions.push("L_SystemPrice <= ?");
        values.push(parsedMaxPrice);
    }

    if (parsedBeds !== undefined) {
        conditions.push("L_Keyword2 >= ?");
        values.push(parsedBeds);
    }

    if (parsedBaths !== undefined) {
        conditions.push("LM_Dec_3 >= ?");
        values.push(parsedBaths);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";



    try {
        const propertiesSql = `
        SELECT *
        FROM rets_property
        ${whereClause}
        ORDER BY ${orderBy}
        LIMIT ?
        OFFSET ?
        `;

        const countSql = `
        SELECT COUNT(*) AS total
        FROM rets_property
        ${whereClause}
        `;

        const propertiesValues = [...values, limit, offset];

        const[rows] = await pool.query(propertiesSql, propertiesValues);
        const [countRows] = await pool.query(countSql, values);

        const total = countRows[0].total;

        return res.status(200).json({
            total,
            limit,
            offset,
            results: rows,
        });
    } catch (error) {
        console.error ("Failed to fetch properties: ", error);

        res.status(500).json({
            error: "Failed to fetch",
        });
    }
});

router.get('/:id/openhouses', async(req, res) => {
    const listingId = req.params.id;

    //Ensure the ID does not exceed the VARCHAR(255) limit.
    if (Buffer.byteLength(listingId, "utf8") > 255) {
        return res.status(400).json({
            error: "Malformed request: Listing ID is too long."
        });
    }

    //Reject any whitespace characters (spaces, tabs, newlines)
    if (/\s/.test(listingId)) {
        return res.status(400).json({
            error: "Malformed request: Listing ID must not contain whitespace."
        });
    }

    try {
        //Check if property exists
        const [propertyRows] = await pool.query('SELECT 1 FROM `rets_property` WHERE `L_ListingID` = ?', [listingId]);

        if (propertyRows.length === 0) {
            return res.status(404).json({
                error: "Property not found."
            });
        }

        const [openHouseRows] = await pool.query('SELECT * FROM `rets_openhouse` WHERE `L_ListingID` = ? ORDER BY OpenHouseDate, OH_StartTime', [listingId]);
        
        return res.status(200).json(openHouseRows);
    } catch (error) {
        console.error('Failed to fetch property openhouse information: ', error);

        return res.status(500).json({ 
            error: "Something went wrong on our end. Please refresh the page or try again in a few minutes." 
        });
    }
});

router.get('/:id', async (req, res) => {
const propertyId = req.params.id;

    //Ensure the ID does not exceed the VARCHAR(255) limit.
    if (Buffer.byteLength(propertyId, "utf8") > 255) {
        return res.status(400).json({
            error: "Malformed request: Listing ID is too long."
        });
    }

    //Reject any whitespace characters (spaces, tabs, newlines)
    if (/\s/.test(propertyId)) {
        return res.status(400).json({
            error: "Malformed request: Listing ID must not contain whitespace."
        });
    }

    try {
        const [rows] = await pool.query('SELECT * FROM `rets_property` WHERE `L_ListingID` = ?', [propertyId]);

        //Extract object from array even if it's just one.
        const property = rows[0];

        //Message when ID is not found
        if (!property) {
            return res.status(404).json({ 
                message: "Property not found. Please, check the entered ID." 
            });
        }

        return res.status(200).json(property);

    } catch (error) {
        console.error('Failed to fetch property: ', error);

        return res.status(500).json({ 
            error: "Something went wrong on our end. Please refresh the page or try again in a few minutes." 
        });
    }
});

module.exports = router;