// Replace the real database pool before loading the routes.
jest.mock("../config/db", () => ({
    query: jest.fn(),
}));

const express = require("express");
const request = require("supertest");
const pool = require("../config/db");
const propertyRoutes = require("./propertyRoutes");

//Create an Express application exclusively for these tests.
const app = express();

app.use(express.json());
app.use("/api/properties", propertyRoutes);

beforeEach(() => {
    jest.clearAllMocks()
});

describe("GET /api/properties", () => {
    test("returns properties using the default pagination values", async () => {
        const fakeProperties = [{
            L_ListingID: "TEST-100",
            L_City: "Boston",
            L_SystemPrice: 500000,
        }];

        // First query: fetch the property rows.
        pool.query.mockResolvedValueOnce([fakeProperties]);

        //Second query: fetch the total property count.
        pool.query.mockResolvedValueOnce([[{total: 1}]]);

        const response = await request(app).get("/api/properties");
        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            total: 1,
            limit: 20,
            offset: 0,
            results: fakeProperties,
        });

        expect(pool.query).toHaveBeenCalledTimes(2);
        expect(pool.query.mock.calls[0][1]).toEqual([20, 0]);
        expect(pool.query.mock.calls[1][1]).toEqual([]);
    });  
    
    test("uses the requested limit and offset", async () => {
        const fakeProperties = [{
            L_ListingID: "TEST-200",
            L_City: "Chicago",
            L_SystemPrice: 350000,
        }];

        pool.query.mockResolvedValueOnce([fakeProperties]);
        pool.query.mockResolvedValueOnce([[{total: 45}]]);

        const response = await request(app)
            .get("/api/properties")
            .query({
                limit: 10,
                offset: 20,
            });

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            total: 45,
            limit: 10,
            offset: 20,
            results: fakeProperties,
        });

        expect(pool.query).toHaveBeenCalledTimes(2);
        expect(pool.query.mock.calls[0][1]).toEqual([10, 20]);
        expect(pool.query.mock.calls[1][1]).toEqual([]);
    });

    test.each([
        [
            "city",
            {city: "Boston"},
            "LOWER(TRIM(L_City)) = LOWER(TRIM(?))",
            "Boston",
        ],
        [
            "zipcode",
            {zipcode: "02110"},
            "TRIM(L_Zip) = TRIM(?)",
            "02110",
        ],
        [
            "minimum price",
            {minPrice: "300000"},
            "L_SystemPrice >= ?",
            300000,
        ],
        [
           "maximum price",
           {maxPrice: "750000"},
           "L_SystemPrice <= ?",
           750000, 
        ],
        [
            "minimum beds",
            {beds: "3"},
            "L_Keyword2 >= ?",
            3,
        ],
        [
           "minimum baths",
           {baths: "2.5"},
            "LM_Dec_3 >= ?",
            2.5,
        ],
    ]) (
        "applies the %s filter", async (filterName, queryParameters, expectedCondition, expectedValue) => {
            pool.query.mockResolvedValueOnce([[]]);
            pool.query.mockResolvedValueOnce([[{total: 0}]]);

            const response = await request(app)
            .get("/api/properties")
            .query(queryParameters);

            expect(response.status).toBe(200);

            const propertiesSql = pool.query.mock.calls[0][0];
            const propertiesValues = pool.query.mock.calls[0][1];

            const countSql = pool.query.mock.calls[1][0];
            const countValues = pool.query.mock.calls[1][1];

            expect(propertiesSql).toContain(expectedCondition);
            expect(countSql).toContain(expectedCondition);

            expect(propertiesValues).toEqual([expectedValue, 20, 0]);
            expect(countValues).toEqual([expectedValue]);
        }
    );

    test("applies the requested sorting", async () => {
        pool.query.mockResolvedValueOnce([[]]);
        pool.query.mockResolvedValueOnce([[{total: 0}]]);

        const response = await request(app)
        .get("/api/properties")
        .query({
            sortBy: "L_SystemPrice",
            sortOrder: "desc",
        });

        expect(response.status).toBe(200);

        const propertiesSql = pool.query.mock.calls[0][0];
        const propertiesValues = pool.query.mock.calls[0][1];

        expect(propertiesSql).toContain("ORDER BY L_SystemPrice DESC");

        expect(propertiesValues).toEqual([20, 0]);
    });

    test.each([
        ["invalid pagination", {limit: 0}],
        ["negative numeric filter", {minPrice: -1}],
        [
            "minimum price greater than maximum price",
            {
                minPrice: 800000,
                maxPrice: 400000,
            },
        ],
        ["invalid sort column", {sortBy: "NotARealColumn"}],
        [
            "invalid sort order",
            {
                sortBy: "L_SystemPrice",
                sortOrder: "sideways",
            },
        ],
    ]) ("rejects %s", async (inputName, queryParameters) => {
        const response = await request(app)
        .get("/api/properties")
        .query(queryParameters);

        expect(response.status).toBe(400);
        expect(pool.query).not.toHaveBeenCalled();
    });
});


describe("GET /api/properties/:id", () => {
    test("returns the property with the requested ID", async () => {
        const fakeProperty = {
            L_ListingID: "TEST-100",
            L_City: "Boston",
            L_SystemPrice: 500000,
        };

        pool.query.mockResolvedValueOnce([[fakeProperty]]);

        const response = await request(app)
        .get("/api/properties/TEST-100");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(fakeProperty);

        expect(pool.query).toHaveBeenCalledTimes(1);
        expect(pool.query.mock.calls[0][1]).toEqual(["TEST-100"]);
    });

    test("returns 404 when the property does not exist", async () => {
        pool.query.mockResolvedValueOnce([[]]);

        const response = await request(app)
        .get("/api/properties/UNKNOWN-ID");

        expect(response.status).toBe(404);

        expect(response.body).toEqual({
            message: "Property not found. Please, check the entered ID.",
        });

        expect(pool.query).toHaveBeenCalledTimes(1);
        expect(pool.query.mock.calls[0][1]).toEqual(["UNKNOWN-ID"]);
    });

    test("returns 400 when the property ID contains whitespace", async () => {
        const response = await request(app)
        .get("/api/properties/BAD%20ID");

        expect(response.status).toBe(400);

        expect(response.body).toEqual({
            error: "Malformed request: Listing ID must not contain whitespace.",
        });

        expect(pool.query).not.toHaveBeenCalled();
    });
});

describe("GET /api/properties/:id/openhouses", () => {
    test("returns the open houses for an existing property", async () => {
        const fakeOpenHouses = [
            {
                L_ListingID: "TEST-100",
                OpenHouseDate: "2026-09-12",
                OH_StartTime: "10:00:00",
            },
            {
                L_ListingID: "TEST-100",
                OpenHouseDate: "2026-09-13",
                OH_StartTime: "13:00:00",
            },
        ];

        //First query: confirm that the property exists.
        pool.query.mockResolvedValueOnce([[{L_ListingID: "TEST-100"}]]);

        //Second query: return the property's open houses.
        pool.query.mockResolvedValueOnce([fakeOpenHouses]);

        const response = await request(app)
        .get("/api/properties/TEST-100/openhouses");

        expect(response.status).toBe(200);
        expect(response.body).toEqual(fakeOpenHouses);

        expect(pool.query).toHaveBeenCalledTimes(2);
        expect(pool.query.mock.calls[0][1]).toEqual(["TEST-100"]);
        expect(pool.query.mock.calls[1][1]).toEqual(["TEST-100"]);
    });

    test("returns an empty array when the property has no open houses", async () => {
        //The property exists.
        pool.query.mockResolvedValueOnce([[{L_ListingID: "TEST-200"}]]);

        //The open-house query finds no rows.
        pool.query.mockResolvedValueOnce([[]]);

        const response = await request(app)
        .get("/api/properties/TEST-200/openhouses");

        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);

        expect(pool.query).toHaveBeenCalledTimes(2);
        expect(pool.query.mock.calls[0][1]).toEqual(["TEST-200"]);
        expect(pool.query.mock.calls[1][1]).toEqual(["TEST-200"]);
    });

    test("returns 404 when the property does not exist", async () => {
        //The property-existence query finds no rows.
        pool.query.mockResolvedValueOnce([[]]);

        const response = await request(app)
        .get("/api/properties/UNKNOWN-ID/openhouses");
        
        expect(response.body).toEqual({
            error: "Property not found.",
        });

        expect(pool.query).toHaveBeenCalledTimes(1);
        expect(pool.query.mock.calls[0][1]).toEqual(["UNKNOWN-ID"]);
    });
});