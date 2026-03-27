# Get Buyer/Seller Companies (Admin)

Admin-only endpoint to retrieve all unique buyer and seller companies from offers.

## Endpoint

`GET /offers/admin/companies`

## Authorization

Requires JWT token with admin or super admin role.

## Headers

- `Authorization`: Bearer token
- `Content-Type`: application/json

## Response

### Success Response (200 OK)

```json
{
    "status": "success",
    "message": "get-companies-success",
    "data": {
        "buyerCompanies": [
            {
                "id": number,
                "name": string,
                "country": string
            }
        ],
        "sellerCompanies": [
            {
                "id": number,
                "name": string,
                "country": string
            }
        ]
    }
}
```

### Error Responses

#### 401 Unauthorized

```json
{
    "error": {
        "statusCode": 401,
        "name": "UnauthorizedError",
        "message": "unauthorized"
    }
}
```

## Example cURL

```bash
curl -X GET 'https://api.example.com/offers/admin/companies' \
-H 'Authorization: Bearer {your_jwt_token}' \
-H 'Content-Type: application/json'
```

## Notes

- Returns two arrays: `buyerCompanies` and `sellerCompanies`
- Each company object contains:
    - `id`: Company identifier
    - `name`: Company name
    - `country`: Country code where the company is located
- Companies are unique (no duplicates)
- Only includes companies that have been involved in offers
- Empty arrays will be returned if no companies are found
