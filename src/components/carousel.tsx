/**
 * carousel.tsx renders the carousel UI component that allows students to navigate 
 */

import { Carousel } from '@mantine/carousel';
import CardC from './Cards';
import { type Unit } from './Cards';
import '@mantine/carousel/styles.css';
import '@mantine/core/styles.css';
import classes from './carousel.module.css';

// Define the carousel
// These are the categories the cards are sorted by
// The cards are sorted in when their 'unit_type' matches the unitType 'value' field
const unitTypes = [
  {
    label: 'JFLCC',
    value: ['JFLCC']
  },
  {
    label: 'JFSOC',
    value: ['Special Operations Forces', 'Special Operations Forces - EZO']
  }
];


// CarouselC() renders all of the carousels
function CarouselC({ units }: { units: Unit[] }) {

  // Where rendering happens
  return (
    <div>
      {/* The map function makes a carousel for each unit type defined above */}
      {unitTypes.map((item) => (
        // Description for each carousel
        <div key={item.label} style={{ marginBottom: 20 }}>
          <h2>{item.label}</h2>
          {/* The Carousel is rendered here */}
          <Carousel
            classNames={{ controls: classes.controls, root: classes.root }}
              align="start"
              slideSize={100}
              slideGap='md'
              controlsOffset={0}
              controlSize={50}
              containScroll='trimSnaps'
              slidesToScroll={3}>
              
              {/* This map function maps renders all the units in it's respective carousel category*/}
              {/* Uses filterUnitsByType to only render the units whose type matches the categpry of current carousel */}
              {filterUnitsByType(item.label, item.value, units).map((unitCard, index) =>
                <Carousel.Slide key={index}>
                  <CardC unit={unitCard} />
                </Carousel.Slide>
              )} {/** End of Card Map */}
            </Carousel>
        </div>
      ))} {/** End of Carousel Map */}
    </div>
  ); // End of return statement

}

// Function to filter units by type
function filterUnitsByType(label: string, value: string | string[], units: Unit[]): Unit[] {
  // This logic for arrays handles the 'JFLCC' case
  if (label === 'JFLCC') {
    return units.filter((unit) => unit.unit_type !== 'Special Operations Forces' && unit.unit_type !== 'Command and Control' && unit.unit_type !== 'Special Operations Forces - EZO');
  }

  // This logic for arrays handles the 'JFSOC' case
  if (Array.isArray(value)) {
    return units.filter((unit) => value.includes(unit.unit_type));
  }

  // Fallback for any other case
  return units.filter((unit) => unit.unit_type === value);
}

export default CarouselC;
