# Bruno Collection

Open the [payment-tracker](./payment-tracker) folder directly in Bruno.

## Environment

Use the `local` environment in:

- `bruno/payment-tracker/environments/local.bru`

Default value:

- `baseUrl = http://localhost:5000/api/v1`

## Suggested test order

1. Run `Health Check`
2. Run `Create Tenant`
3. Copy the returned tenant `_id` into `tenantId`
4. Run `Create Unit`
5. Copy the returned unit `_id` into `unitId`
6. Run `Create Agreement`
7. Copy the returned agreement `_id` into `agreementId`
8. Run `Record Payment`

After that, the `Get One`, `Update`, `Delete`, and payment history requests will work with the same saved IDs.
