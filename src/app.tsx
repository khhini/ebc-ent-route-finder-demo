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

import React, { useState, useEffect} from 'react';
import { createRoot } from "react-dom/client";
import { APIProvider, Map, MapCameraChangedEvent, useMap, useMapsLibrary} from '@vis.gl/react-google-maps';

const Directions = ({origin, destination}) => {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] =
    useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer>();
  const [routes, setRoutes] = useState<google.maps.DirectionsRoute[]>([]);
  const [routeIndex, setRouteIndex] = useState(0);
  const selected = routes[routeIndex];
  const leg = selected?.legs[0];

  // Initialize directions service and renderer
  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(
      new routesLibrary.DirectionsRenderer({
        draggable: true, // Only necessary for draggable markers
        map
      })
    );
  }, [routesLibrary, map]);

  // Add the following useEffect to make markers draggable
  useEffect(() => {
    if (!directionsRenderer) return;

    // Add the listener to update routes when directions change
    const listener = directionsRenderer.addListener(
      'directions_changed',
      () => {
        const result = directionsRenderer.getDirections();
        if (result) {
          setRoutes(result.routes);
        }
      }
    );

    return () => google.maps.event.removeListener(listener);
  }, [directionsRenderer]);

  // Use directions service
  useEffect(() => {
    if (!directionsService || !directionsRenderer || !origin || !destination) return;

    console.log("Fetching new route for:", origin, "to", destination);

    directionsRenderer.setMap(map);

    directionsService
      .route({
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true
      })
      .then(response => {
        directionsRenderer.setDirections(response);
        setRoutes(response.routes);
        setRouteIndex(0);
      });

    return () => directionsRenderer.setMap(null);
  }, [directionsService, directionsRenderer, origin, destination]);

  // Update direction route
  useEffect(() => {
    if (!directionsRenderer) return;
    directionsRenderer.setRouteIndex(routeIndex);
  }, [routeIndex, directionsRenderer]);

  if (!leg) return null;

  return (
    <div className="directions">
      <h2>{selected.summary}</h2>
      <p>
        {leg.start_address.split(',')[0]} to {leg.end_address.split(',')[0]}
      </p>
      <p>Distance: {leg.distance?.text}</p>
      <p>Duration: {leg.duration?.text}</p>

      <h2>Other Routes</h2>
      <ul>
        {routes.map((route, index) => (
          <li key={route.summary}>
            <button onClick={() => setRouteIndex(index)}>
              {route.summary}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const ControlPane = ({ setOrigin, setDestination}) => {
  const [inputOrigin, setInputOrigin] = useState(null);
  const [inputDestination, setInputDestination] = useState(null);

  return (
    <div className='control-pane'>
      <ul>
        <li>
          <input 
            type='text' 
            className='controls' 
            placeholder='Enter origin'
            onChange={(e) => setInputOrigin(e.target.value)}
          />
        </li>
        <li>
          <input 
            type='text' 
            className='controls' 
            placeholder='Enter origin'
            onChange={(e) => setInputDestination(e.target.value)}
          />
        </li>
        <li>
          <button onClick={() => { 
            setOrigin(inputOrigin); 
            setDestination(inputDestination);
          }}>
            Find Route
          </button>
        </li>
      </ul>
    </div>
  )
}

const API_KEY = globalThis.GOOGLE_MAPS_API_KEY ?? (process.env.GOOGLE_MAPS_API_KEY as string);

const App = () => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  return (
    <APIProvider apiKey={API_KEY} onLoad={ () => console.log('Maps API has loaded')} >
      <Map 
        defaultZoom={13}
        defaultCenter={ { lat:-6.262273750432054, lng: 106.83121588674571 }}
        disableDefaultUI={true}
        onCameraChanged={ (ev: MapCameraChangedEvent) => 
          console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
        }>
        <ControlPane setOrigin={setOrigin} setDestination={setDestination}/>
        <Directions origin={origin} destination={destination}/>
      </Map>
    </APIProvider>
  )
};

const root = createRoot(document.getElementById('app'));
root.render(<App />);

export default App;
