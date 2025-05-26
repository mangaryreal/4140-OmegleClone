# Omegle Clone Backend

This is Omegle Clone Backend. This supports multipeople chat and report button.

### <p style="color:cyan">Version Update 0.0.1</p>
- Added database init code
- Added dockerfile

## Highlights

- Multipeople Video and Text Chat: We could support up to 4 people to join the room.
- Keep anomity: The project aims to keep the adequate anomity for users to chat with each others.
- Report button: Users could report the users who behaves unwell. Toxic users will receive panelty that cannot login our service in case-by-case basis.

## How to use backend
1. set-up PostgreSQL (You could change it by using other method)
2. change .env file
3. install all npm dependencies
4. run it by calling npm run dev

## Code structure
- index.js: All SOcket.IO code, routes, and auxiliary functions
- dbconnect.js: make PostgreSQL connection pool
- .env: stored PostgreSQL database config
- ./api: all REST API functions
- ./api/login: login function, with unban checking
- ./api/protected: validate user for frontend
- ./api/register: function to register new account
- ./api/report: function to report user when chatting


## License

This project is protected by the Apache 2.0 license.

## Contribution

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
