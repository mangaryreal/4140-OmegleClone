# Omegle Clone Frontend

This is Omegle Clone Frontend. This supports multipeople chat and report button.

### <p style="color:cyan">Version Update 0.0.1</p>
- Added dockerfile

## Highlights

- Multipeople Video and Text Chat: We could support up to 4 people to join the room.
- Keep anomity: The project aims to keep the adequate anomity for users to chat with each others.
- Report button: Users could report the users who behaves unwell. Toxic users will receive panelty that cannot login our service in case-by-case basis.

## How to use frontend (in dev mode)
1. set-up the [backend](/backend) (You could change it by using other method)
2. install all npm dependencies
```bash
npm install
```
2. run it by calling npm run start
```bash
npm run start
```

## Code structure
```
src/
├── component/
│   ├── buttons.js          # the control buttons
│   ├── TextChat.js         # the text chat box
│   ├── TextMessage.js      # one line of text chat
│   └── vodeiStreaming.js   # video chat box
├── pages/
│   ├── Banned.js           # "You Got Banned" Screen
│   ├── Login.js            # Login Screen
│   ├── Register.js         # Register Screen
│   └── Main.js             # Main Screen, aka the video and text chat
├── *.css                   # Simple styline
├── App.js                  # The main app file contains all routes
└──  ... Other files
```


## License

This project is protected by the Apache 2.0 license.

## Contribution

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
