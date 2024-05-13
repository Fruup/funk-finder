# Notes

## Deployment takeaways

- Railway volumes override the directory.
- Envs ORIGIN, HOST_HEADER, PROTOCOL_HEADER are essential for the deployment (esp. on Railway).
- Wait for Railway to remove a previous deployment. Otherwise, the old one will be used (smh).
- IPv6 for local networking on Railway.
