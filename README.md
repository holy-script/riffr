# Riffr - Montage Time! (riffr)

Riffr helps you literally 'riff' through images - centered around a face and creating a photo montage. 

## A bit more detail about Riffr

You're allowed to choose up to 120 images(nice, right?), run the detection on them, and then you edit photos with faces detected and size them up accordingly. Also, you choose a frame rate, that is, how fast the images go by, and you can play and pause the editor to check out a preview with those settings. When you're done, the tool compiles these cached images and their configs and wraps it all up together in a neat little video. 

<table>
  <tr>
     <td>Add your pictures</td>
     <td>Select the right faces, frame rate, zoom</td>
  </tr>
  <tr>
    <td valign="top"><img src = "https://user-images.githubusercontent.com/84567489/202893519-a20faac7-9b2f-4913-8d6d-a6bda7cac3cf.png" width=500 /></td>
    <td valign="top"><img src = "https://user-images.githubusercontent.com/84567489/202893560-b765257c-8b85-48a5-9110-d0df31e6bcad.png" width=500 /></td>

  </tr>
  <tr>
     <td>Compile</td>
     <td>Voila! your montage</td>
  </tr>

  <tr>
    <td valign="top"><img src = "https://user-images.githubusercontent.com/84567489/202893566-460c9cd0-4f42-4c18-8a1a-eb907193ebdb.png" width=500 /></td>
    <td valign="top"><img src = "https://user-images.githubusercontent.com/84567489/202893572-2158d810-48b7-402d-a61c-857be6784dcc.png" width=500 /></td>
  </tr>
 </table>
 
 
 > The final product will be something like this
<img src = "https://user-images.githubusercontent.com/84567489/202893757-a2c5772f-e729-4b61-941c-52c9f40bc2fc.gif" width=500 />

## Install the dependencies
```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```


### Lint the files
```bash
yarn lint
# or
npm run lint
```


### Format the files
```bash
yarn format
# or
npm run format
```



### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
