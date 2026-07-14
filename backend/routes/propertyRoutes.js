const express = require("express");
const pool = require("../config/db");

const router = express.Router();


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
            "minPrice, MaxPrice, beds, and baths must be valid non-negative numbers",
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
        ORDER BY L_ListingID
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
        console.error ("Failed to fetch prperties: ", error);

        res.status(500).json({
            error: "Failed to fetch",
        });
    }
});

module.exports = router;

