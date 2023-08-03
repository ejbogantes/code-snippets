/* eslint-disable dot-notation */
// import styles from './soom-world-map.module.scss';

import React from 'react';
import { find as _find } from 'lodash';

// material
import Tooltip from '@mui/material/Tooltip';

// react map
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

// countries map for the component
import countriesWorldMap from './countries-world-map';

// constants
const normalColor = {
  default: '#0066ff',
  hover: '#0044dd',
  pressed: '#0022aa'
};

const selectedColor = {
  default: '#de0707',
  hover: '#b50707',
  pressed: '#910606'
};

const disableColor = {
  default: '#eeeeee',
  hover: '#eeeeee',
  pressed: '#eeeeee'
};

export interface SoomWorldMapOption {
  value: string;
  label: string;
}

/* eslint-disable-next-line */
export interface SoomWorldMapProps {
  /**
   * This field it's using to indicate the available countries in the map
   */
  countries: SoomWorldMapOption[];
  /**
   * This field it's using to indicate the country code selected
   */
  selectedValue?: string;
  /**
   * This field it's using to indicate the action when a country is clicked
   */
  onClick?: (country: SoomWorldMapOption) => void;
}

export function SoomWorldMap(props: SoomWorldMapProps) {
  const { countries, selectedValue, onClick } = props;

  return (
    <div style={{ textAlign: 'center' }}>
      <ComposableMap
        style={{ maxHeight: '600px', border: '1px solid #dddddd', borderRadius: '5px', cursor: 'pointer' }}
      >
        <ZoomableGroup>
          <Geographies geography={countriesWorldMap}>
            {({ geographies }) =>
              geographies.map((geo) => {
                let countryCode = geo.properties['Alpha-2'];
                if (!countryCode) {
                  return null;
                }

                countryCode = countryCode.toLowerCase();
                const country = _find(countries, (c) => {
                  return c.value === countryCode;
                });
                const countryName = country ? country.label : '';

                let color = normalColor;
                if (!country) {
                  color = disableColor;
                } else if (countryCode === selectedValue) {
                  color = selectedColor;
                }

                return (
                  <Tooltip key={geo.rsmKey} title={countryName}>
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={(e) => {
                        if (country && onClick) {
                          onClick(country);
                        }
                      }}
                      onMouseEnter={() => {
                        if (country) {
                          // actions
                        }
                      }}
                      onMouseLeave={() => {
                        if (country) {
                          // actions
                        }
                      }}
                      style={{
                        default: { fill: color.default, outline: 'none' },
                        hover: { fill: color.hover, outline: 'none' },
                        pressed: { fill: color.pressed, outline: 'none' }
                      }}
                    />
                  </Tooltip>
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}

export default SoomWorldMap;
