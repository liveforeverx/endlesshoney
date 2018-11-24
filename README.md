# Endlesshoney

To start your Phoenix server:

  * Install dependencies with `mix deps.get`
  * Create and migrate your database with `mix ecto.create && mix ecto.migrate`
  * Install Node.js dependencies with `cd assets && npm install`
  * Start Phoenix endpoint with `mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

Ready to run in production? Please [check our deployment guides](http://www.phoenixframework.org/docs/deployment).

## For development

To use WebRTC https is mandatory, to generate a self-signed certificate run the following commands:

```
openssl genrsa -out endlesshoney_dev.key 2048
openssl req -new -x509 -key endlesshoney_dev.key -out endlesshoney_dev.cert -days 3650 -subj /CN=localhost
mkdir priv/keys
mv endlesshoney_dev.* priv/keys
```

## Learn more

  * Official website: http://www.phoenixframework.org/
  * Guides: http://phoenixframework.org/docs/overview
  * Docs: https://hexdocs.pm/phoenix
  * Mailing list: http://groups.google.com/group/phoenix-talk
  * Source: https://github.com/phoenixframework/phoenix
