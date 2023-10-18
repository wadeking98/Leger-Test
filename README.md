# Ledger Test
A simple framework to speed test different ledger requests.
currently only uses AFJ.

## Adding a test:
Go into tests.json and create another test by adding a JSON object like so:
```json
"<TEST NAME>": {
        "schemas": [
            {
                "id": "<SCHEMA ID>",
                "label": "dev"
            }
        ],
        "credDefs": [
            {
                "id": "<CREDDEF ID>",
                "label": "dev"
            }
        ],
        "revocRegDef": [
            {
                "id": "<REVOCATION REG DEF ID>",
                "label":"dev"
            }
        ]
    },
```

Then run `yarn install` to install all dependencies

## Running the application:
`ts-node index.ts`