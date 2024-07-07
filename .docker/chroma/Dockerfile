FROM chromadb/chroma

ARG CHROMA_AUTH_ENCRYPTED

# Write credentials file.
RUN <<EOF
	if [ -z "${CHROMA_AUTH_ENCRYPTED}" ]; then
		echo "❌ CHROMA_AUTH_ENCRYPTED is required"
		exit 1
	else
		echo "${CHROMA_AUTH_ENCRYPTED}" > ./server.htpasswd
	fi
EOF

ENV CHROMA_SERVER_AUTHN_PROVIDER="chromadb.auth.basic_authn.BasicAuthenticationServerProvider"
ENV CHROMA_SERVER_AUTHN_CREDENTIALS_FILE="server.htpasswd"

EXPOSE 8000
