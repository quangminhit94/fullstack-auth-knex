cp .env.sample .env
createdb sticker-mania
yarn
knex migrate:latest
knex seed:run
