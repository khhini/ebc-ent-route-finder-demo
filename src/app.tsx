/**
 * Copyright 2024 Google LLC
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    https://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

import React from 'react';
import { createRoot } from "react-dom/client";
import { APIProvider, Map, MapCameraChangedEvent} from '@vis.gl/react-google-maps';

const App = () => (
  <APIProvider apiKey={'AIzaSyAQOaOB1jnoSdf-hqIvWFxzn5HkNzg8_sI'} onLoad={ () => console.log('Maps API has loaded')} >
    <Map 
      defaultZoom={13}
      defaultCenter={ { lat:-6.262273750432054, lng: 106.83121588674571 }}
      mapId='4af6d8528552277'
      onCameraChanged={ (ev: MapCameraChangedEvent) => 
        console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
      }>
    </Map>
  </APIProvider>
);

const root = createRoot(document.getElementById('app'));
root.render(<App />);

export default App;
