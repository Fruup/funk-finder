# Notes

## Deployment takeaways

- Railway volumes override the directory.
- Envs ORIGIN, HOST_HEADER, PROTOCOL_HEADER are essential for the deployment (esp. on Railway).
- Wait for Railway to remove a previous deployment. Otherwise, the old one will be used (smh).
- IPv6 for local networking on Railway.

## Image Reloading

Initially, image URLs were reloaded on demand as they expire after a few days. This was to circumvent storing all images in a database. However, Instagram limited the number of requests to their servers making this approach impossible. The following options were considered:

- **Caching**: Store images in a database and serve them from there. This would require consent from the Instagram account's owner.
- **Do not display images at all**: Merely showing text and links to the posts.

The latter was chosen as it was the simplest solution. The user can still click on the link to view the post on Instagram.
