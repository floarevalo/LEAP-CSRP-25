/** BattlePage.tsx takes in a unit from the studentPage.tsx and conducts an engagement with an enemy unit that a cadet selects. 
 * Enemy unit selection drop down populates with enemy units in the selected unit's WEZ. Calculates detection ability probability, 
 * accuracy percentage, and damage while providing feedback at the end of each round. 
 * The engagement continues until either the friendly or enemy unit dies and the information is logged in the After Action Reviews Page **/

import React, { useEffect, useState } from 'react';
import '@mantine/core/styles.css';
import '../App.css';
import { Table, Progress, Text, Group, Image, Stepper, Button, SegmentedControl, rem, MantineProvider, Grid, Card, Center, Select, useMantineTheme, rgba, Tooltip, Space, Container } from '@mantine/core';
import { useInterval } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
import { IconSwords, IconHeartbeat, IconNumber1Small, IconNumber2Small, IconNumber3Small, IconNumber4Small, IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import { useUserRole } from '../context/UserContext';
import { useUnitProvider } from '../context/UnitContext';
import { Unit } from '../components/Cards';
import classes from './battlePage.module.css';
import axios from 'axios';
import getImageSRC from '../context/imageSrc';


// The interface that is used to take in and send variables for the tactics tables
export interface Form {
  ID: string;
  friendlyScore: number;
  enemyScore: number;
  friendlyAnswer: 'Yes' | 'No'; 
  enemyAnswer: 'Yes' | 'No'; 
}

interface UnitTactics {
  awareness: number;
  logistics: number;
  coverage: number;
  gps: number;
  comms: number;
  fire: number;
  pattern: number;
}

interface tacticsData {
  FriendlyISR: number;
  EnemyISR: number;
  FriendlyLogistics: number;
  EnemyLogistics: number;
  FriendlyCritical: number;
  EnemyCritical: number;
  FriendlyGPS: number;
  EnemyGPS: number;
  FriendlyComms: number;
  EnemyComms: number;
  FriendlyCAS: number;
  EnemyCAS: number;
  FriendlyAccess: number;
  EnemyAccess: number;
  engagementid?: number;
  firstAttackFriendly?: boolean;
  friendlyAccuracyPercent: number;
  friendlyAccuracyLevel: string;
  enemyAccuracyPercent: number;
  enemyAccuracyLevel: string;
  friendlyDamage: number;
  enemyDamage: number;
  detectionPositiveFeedback: string;
  detectionNegativeFeedback: string;
  accuracyPositiveFeedback: string;
  accuracyNegativeFeedback: string;
  damagePositiveFeedback: string;
  damageNegativeFeedback: string
}

// define PresetTacticsResponse interface to be used when calling backend to populate preset enemy tactics
interface PresetTacticsResponse {
  tactics: UnitTactics;
}

function BattlePage() {
  //Initializes global variables
  const navigate = useNavigate(); // A way to navigate to different pages
  const { userSection } = useUserRole(); // Tracks the class section
  const [active, setActive] = useState(0);
  const closeLocation = '/studentPage/' + userSection; // A way to navigate back to the correct section of the student page
  const { selectedUnit, setSelectedUnit } = useUnitProvider(); // Tracks the selected unit for an engagement
  const [baseValue, setBaseValue] = useState<number>(0); // State to track the base value (based on characteristics of each individual unit) of a unit
  const [TacticsScore, setTacticsScore] = useState<number | null>(null); // State to track the real time (tactics) score of a FRIENDLY unit
  const [enemyTacticsScore, setEnemyTacticsScore] = useState<number | null>(null); // State to track the real time (tactics) score of an ENEMY unit
  const [units, setUnits] = useState<Unit[]>([]);
  const [progress, setProgress] = useState(0); // Used to calculate the progress of the animation for the finalize tactics button
  const [loaded, setLoaded] = useState(false); // creates variable to wait for after conflict calculations to be done
  const theme = useMantineTheme();
  const [friendlyHealth, setFriendlyHealth] = useState<number>(0); // Variables for setting and getting the friendly unit health
  const [enemyHealth, setEnemyHealth] = useState<number>(0); // Variables for setting and getting the enemy unit health
  const [enemyUnit, setEnemyUnit] = useState<Unit | null>(null); // Variables for setting and getting the enemy unit
  const [inEngagement, setInEngagement] = useState<Boolean>(false); // Used to track whether a unit is in an engagement or not
  const [round, setRound] = useState<number>(1); // Sets the round number for each round of the engagement
  const [totalEnemyDamage, setTotalEnemyDamage] = useState<number>(0);
  const [totalFriendlyDamage, setTotalFriendlyDamage] = useState<number>(0);
  const [enemyUnits, setEnemyUnits] = useState<Unit[]>([]);
  const [unitTactics, setUnitTactics] = useState<UnitTactics | null>(null);
  const [enemyBaseValue, setEnemyBaseValue] = useState<number>(0); // Sets and gets the state for the enemy base value 
  const [enemyWithinWEZ, setEnemeyWithinWEZ] = useState<Unit[]>([]); //array of strings that tracks enemies within the WEZ
  const [isLoadingUnits, setisLoadingUnits] = useState(true); //creates variable to check that data for units has loaded before the engagement can start
  const [submittedAnswers, setSubmittedAnswers] = useState<Form[] | null>(null); //ensure tactics answers submitted right 
  const [firstAttackFriendly, setFirstAttackFriendly] = useState<Boolean>(false);
  const [friendlyAccuracyLevel, setFriendlyAccuracyLevel] = useState<string>("Low");
  const [enemyAccuracyLevel, setEnemyAccuracyLevel] = useState<string>("Low");
  const [friendlyAccuracyPercent, setFriendlyAccuracyPercent] = useState<number | 0>(0);
  const [enemyAccuracyPercent, setEnemyAccuracyPercent] = useState<number | 0>(0);
  const [detectionPositiveFeedback, setDetectionPositiveFeedback] = useState("Positive detection factors will be listed here.");
  const [detectionNegativeFeedback, setDetectionNegativeFeedback] = useState("Negative detection factors will be listed here.");
  const [accuracyPositiveFeedback, setAccuracyPositiveFeedback] = useState("Positive accuracy factors will be listed here.");
  const [accuracyNegativeFeedback, setAccuracyNegativeFeedback] = useState("Negative accuracy factors will be listed here.");
  const [damagePositiveFeedback, setDamagePositiveFeedback] = useState("Positive damage factors will be listed here.");
  const [damageNegativeFeedback, setDamageNegativeFeedback] = useState("Negative damage factors will be listed here.");

  // Fetches data of the units(friendly units) based on class section
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<Unit[]>(`${process.env.REACT_APP_BACKEND_URL}/api/units/sectionSort`, {
          params: {
            sectionid: userSection  // Pass userSection as a query parameter
          }
        });
        setUnits(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setisLoadingUnits(false);
      }
    };
    fetchData();
  }, []);

  // Fetches data of the enemy units based on class section
  useEffect(() => {

    // const fetchEnemyWithinWEZ = async () => {
    //   let enemyWithinWEZ: Unit[] = [];  // ✅ initialize the array
    //   console.log(enemyUnitsLocal);
    //   for (const eUnit of enemyUnitsLocal) {
    //     const isInWEZ = await checkWEZ(eUnit.unit_id);
    //     if (isInWEZ) {
    //       enemyWithinWEZ.push(eUnit);
    //       console.log("in WEZ");
    //     }
    //   }
    //   setEnemeyWithinWEZ(enemyWithinWEZ);
    //};
    const fetchData = async () => {
      try {
        const response = await axios.get<Unit[]>(`${process.env.REACT_APP_BACKEND_URL}/api/units/enemyUnits`, {
          params: {
            sectionid: userSection  // Pass userSection as a query parameter
          }
        });
        setEnemyUnits(response.data);
        let enemyUnitsLocal: Unit[] = [];
        for (const eUnit of response.data) {
          const isInWEZ = await checkWEZ(eUnit.unit_id);
          if (isInWEZ) {
            enemyUnitsLocal.push(eUnit);
          }
        }

        setEnemeyWithinWEZ(enemyUnitsLocal);
      } catch (error) {
        console.error('Error fetching data:', error);
      }

      //fetchEnemyWithinWEZ();
      console.log(enemyWithinWEZ);
    }
    fetchData();
  }, []);

  // // fetches enemy tactics from preset tactics
  // useEffect(() => {
  //   const fetchUnitTactics = async () => {
  //     // Make sure there is an enemyUnit and it has a name before fetching
  //     if (!enemyUnit?.unit_name) {
  //       return;
  //     }
  //     // call backend to get enemy tactics from preset_tactics
  //     try {
  //       const response = await axios.get<PresetTacticsResponse>(`${process.env.REACT_APP_BACKEND_URL}/api/preset_tactics/`,
  //         {
  //           params: {
  //             unit_name: enemyUnit?.unit_name
  //           }
  //         }
  //       );
  //       setUnitTactics(response.data.tactics);
  //     } catch (error) {
  //       console.error('Error fetching unit tactics:', error);
  //       setUnitTactics(null);
  //     }
  //   };

  //   if (enemyUnit) {
  //     fetchUnitTactics();
  //   }
  // }, [enemyUnit]);




  //initializes the characteristics of each friendly unit
  const unit: Unit | undefined = units.find((u) => u.unit_id === selectedUnit);
  const {
    unit_type,
    unit_health,
    unit_size,
    unit_mobility,
    unit_readiness,
    unit_skill,
    unit_id,
    unit_name
  } = unit || {};


  // function to update unit health after each round of an engagement
  const updateUnitHealth = async (id: number, newHealth: number) => {
    const url = `${process.env.REACT_APP_BACKEND_URL}/api/units/health`; // Corrected URL to point to the server running on port 5000
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, newHealth }), // Send both id and newHealth in the body
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Failed to update unit health: ${response.statusText}`);
      }
      const updatedUnit = await response.json();
      console.log('Updated unit:', updatedUnit);
      return updatedUnit;
    } catch (error) {
      console.error('Error updating unit health:', error);
    }
  };

  // function for the button (either 'Next Round' or 'Done') that moves an engagement from one round to another based on health of both the enemy and friendly units
  const handleNextRound = (currentFriendlyHealth: number, currentEnemyHealth: number) => {
    if (currentEnemyHealth > 0 && currentFriendlyHealth > 0) {
      // If we are continuing the engagement, save the health and reset the engagement GUI
      setActive(0);
      setLoaded(false);
    } else {
      if (friendlyHealth > 0) {
        updateUnitHealth(Number(unit_id), friendlyHealth);
      } else {
        updateUnitHealth(Number(unit_id), 0);
      }

      if (enemyHealth > 0) {
        updateUnitHealth(Number(enemyUnit?.unit_id), enemyHealth);
      } else {
        updateUnitHealth(Number(enemyUnit?.unit_id), 0);
      }

      setSelectedUnit(null);
      navigate(closeLocation);
    }
  }

  // Function that selects an enemy unit when it is clicked on to start an engagement
  // Handle select enemy unit change
  const handleSelectEnemy = (value: string | null) => {
    const selectedUnit = enemyUnits.find(unit => unit.unit_id.toString() === value);
    setEnemyUnit(selectedUnit || null);
    // Set initial enemyHealth based on enemy unit health
    //Note: error?
    setEnemyHealth(selectedUnit?.unit_health ?? 0);
  };

  // Handle deselect enemy unit
  const handleDeselectEnemy = () => {
    setEnemyUnit(null);
  };

  //handler function to start an engagement and move into the yes/no question pages
  const handleStartEngagement = () => {
    setInEngagement(true);
    nextStep();
  }

  //function that calculates the base value based on the overall characteristics of a unit
  //Note: may be used as a ref to calculate the WEZ? keys are of type string, and values are of type number
  const calculateBaseValue = (unit: Unit) => {
    const unitTypeValues: Record<string, number> = {
      "Command and Control": 20, "Infantry": 30, "Reconnaissance": 10, "Armored Mechanized": 40,
      "Combined Arms": 50, "Armored Mechanized Tracked": 60, "Armor Company": 60, "Field Artillery": 30, "Self-propelled": 40,
      "Electronic Warfare": 10, "Signal": 5, "Special Operations Forces": 40, "Special Operations Forces - EZO": 40, "Ammunition": 5,
      "Air Defense": 30, "Engineer": 5, "Air Assault": 50, "Medical Treatment Facility": 5,
      "Aviation Rotary Wing": 60, "Combat Support": 20, "Sustainment": 10, "Unmanned Aerial Systems": 10,
      "Combat Service Support": 20, "Petroleum, Oil and Lubricants": 10, "Sea Port": 5, "Railhead": 5
    };
    const roleTypeValues: Record<string, number> = { "Combat": 90, "Headquarters": 50, "Support": 30, "Supply Materials": 20, "Facility": 10 };
    const unitSizeValues: Record<string, number> = { "Squad/Team": 20, "Platoon": 40, "Company/Battery": 50, "Battalion": 60, "Brigade/Regiment": 70, "Division": 80, "Corps": 90, "UAS (1)": 30, "Aviation Section (2)": 80, "Aviation Flight (4)": 30 };
    const forcePostureValues: Record<string, number> = { "Offensive Only": 50, "Defensive Only": 70, "Offense and Defense": 90 };
    const forceMobilityValues: Record<string, number> = { "Fixed": 10, "Mobile (foot)": 30, "Mobile (wheeled)": 50, "Mobile (track)": 40, "Stationary": 20, "Flight (fixed wing)": 90, "Flight (rotary wing)": 70 };
    const forceReadinessValues: Record<string, number> = { "Low": 10, "Medium": 50, "High": 90 };
    const forceSkillValues: Record<string, number> = { "Untrained": 10, "Basic": 40, "Advanced": 70, "Elite": 90 };

    const typeValue = unitTypeValues[unit.unit_type] || 0;
    const roleValue = roleTypeValues[unit.unit_role] || 0;
    const sizeValue = unitSizeValues[unit.unit_size] || 0;
    const postureValue = forcePostureValues[unit.unit_posture] || 0;
    const mobilityValue = forceMobilityValues[unit.unit_mobility] || 0;
    const readinessValue = forceReadinessValues[unit.unit_readiness] || 0;
    const skillValue = forceSkillValues[unit.unit_skill] || 0;

    // Overall equation to calculate the base score based on different weight values
    const baseValue = 0.15 * typeValue + 0.02 * roleValue + 0.25 * sizeValue + 0.10 * postureValue +
      0.10 * mobilityValue + 0.04 * readinessValue + 0.04 * skillValue;

    return baseValue;
  };

  //calls the calculateBaseValue() equation and initializes health variables for each unit and ensures that each unit is not currently in an engagement
  useEffect(() => {
    if (unit) {
      const calculatedValue = calculateBaseValue(unit);
      setBaseValue(calculatedValue);

      // Set initial friendlyHealth based on unit_health
      if (!inEngagement) {
        console.log('Inital FriendlyHealth set to ' + unit.unit_health);
        setFriendlyHealth(unit.unit_health ?? 0);
      }

      // Set initial inEngagement to false
      setInEngagement(false);
    }
  }, [unit]);

  //calls the calculateBaseValue() equation and initializes health variables for each enemy unit and ensures that each unit is not currently in an engagement
  useEffect(() => {
    if (enemyUnit) {
      const calculatedValue = calculateBaseValue(enemyUnit);
      setEnemyBaseValue(calculatedValue);

      // Set initial inEngagement to false
      setInEngagement(false);
    }
  }, [enemyUnit]);


  //function to move to the next set of questions or backwards in the yes/no questions sections
  const nextStep = () => setActive((current) => (current < 6 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));



  // Update user answers
  const [question1, setQuestion1] = useState('Yes')
  const [question2, setQuestion2] = useState('Yes')
  const [question3, setQuestion3] = useState('Yes')
  const [question4, setQuestion4] = useState('Yes')
  const [question5, setQuestion5] = useState('Yes')
  const [question6, setQuestion6] = useState('Yes')
  const [question7, setQuestion7] = useState('Yes')

  const [enemyquestion1, setEnemyQuestion1] = useState('Yes')
  const [enemyquestion2, setEnemyQuestion2] = useState('Yes')
  const [enemyquestion3, setEnemyQuestion3] = useState('Yes')
  const [enemyquestion4, setEnemyQuestion4] = useState('Yes')
  const [enemyquestion5, setEnemyQuestion5] = useState('Yes')
  const [enemyquestion6, setEnemyQuestion6] = useState('Yes')
  const [enemyquestion7, setEnemyQuestion7] = useState('Yes')

  // This function handles the engagement tactics form submission
  const finalizeTactics = async () => { 

    // If 'unit' or 'enemyUnit' is not defined, log an error and exit the function.
    if (!unit || !enemyUnit) {
      console.error("Cannot finalize tactics: Friendly or enemy unit is missing.");
      return; // Exit the function early
    }
    
    // Convert question answers from strings to numbers + initialize tactics feedback data 
    let currentTacticsData: tacticsData = {
      FriendlyISR: question1 === "Yes" ? 1 : 0,
      EnemyISR: enemyquestion1 === "Yes" ? 1 : 0,
      FriendlyLogistics: question2 === "Yes" ? 1 : 0,
      EnemyLogistics: enemyquestion2 === "Yes" ? 1 : 0,
      FriendlyCritical: question3 === "Yes" ? 1 : 0,
      EnemyCritical: enemyquestion3 === "Yes" ? 1 : 0,
      FriendlyGPS: question4 === "Yes" ? 1 : 0,
      EnemyGPS: enemyquestion4 === "Yes" ? 1 : 0,
      FriendlyComms: question5 === "Yes" ? 1 : 0,
      EnemyComms: enemyquestion5 === "Yes" ? 1 : 0,
      FriendlyCAS: question6 === "Yes" ? 1 : 0,
      EnemyCAS: enemyquestion6 === "Yes" ? 1 : 0,
      FriendlyAccess: question7 === "Yes" ? 1 : 0,
      EnemyAccess: enemyquestion7 === "Yes" ? 1 : 0,
      engagementid: undefined,
      firstAttackFriendly: false,
      friendlyAccuracyPercent: 0,
      friendlyAccuracyLevel: "Low",
      enemyAccuracyPercent: 0,
      enemyAccuracyLevel: "Low",
      friendlyDamage: 0,
      enemyDamage: 0,
      detectionPositiveFeedback: "",
      detectionNegativeFeedback: "",
      accuracyPositiveFeedback: "",
      accuracyNegativeFeedback: "",
      damagePositiveFeedback: "",
      damageNegativeFeedback: ""
    };

    // ------------------- DETECTION PHASE ------------------------------------------------------------------------------------------
    // This phase defines the probability of detection and if friendly gets to attack first or not 

    const unitDetectionBeamWidth: Record<string, number> = { // Corresponds to "w" variable in LEAP_parameters_v3.xlsx
      "Infantry": 12,
      "Combined Arms": 15,
      "Armor Company": 17,
      "Field Artillery": 18,
      "Special Operations Forces": 5, "Special Operations Forces - EZO": 5,
      "Combat Support": 17,
      // These unit types not currently implemented into current MDL scenario
      "Reconnaissance": 12,
      "Command and Control": 0, // No value provided in the sheet, assuming 0
      "Armored Mechanized": 17,
      "Armored Mechanized Tracked": 17,
      "Self-propelled": 18,
      "Electronic Warfare": 20,
      "Signal": 20,
      "Ammunition": 10,
      "Air Defense": 30,
      "Engineer": 17,
      "Air Assault": 15,
      "Medical Treatment Facility": 12,
      "Aviation Rotary Wing": 15,
      "Sustainment": 17,
      "Unmanned Aerial Systems": 3,
      "Combat Service Support": 10,
      "Petroleum, Oil and Lubricants": 10,
      "Sea Port": 20,
      "Railhead": 20
    };
    const unitSphereOfInflu: Record<string, number> = { //// Corresponds to "A" variable in LEAP_parameters_v3.xlsx
      "Infantry": 45,
      "Combined Arms": 50,
      "Armor Company": 25,
      "Field Artillery": 15,
      "Special Operations Forces": 80, "Special Operations Forces - EZO": 80,
      "Combat Support": 20,
      // These unit types not currently implemented into current MDL scenario
      "Reconnaissance": 30,
      "Command and Control": 0, // No value provided, assuming 0
      "Armored Mechanized": 25,
      "Armored Mechanized Tracked": 20,
      "Self-propelled": 22,
      "Electronic Warfare": 10,
      "Signal": 40,
      "Ammunition": 10,
      "Air Defense": 10,
      "Engineer": 20,
      "Air Assault": 50,
      "Medical Treatment Facility": 15,
      "Aviation Rotary Wing": 50,
      "Sustainment": 20,
      "Unmanned Aerial Systems": 10,
      "Combat Service Support": 10,
      "Petroleum, Oil and Lubricants": 15,
      "Sea Port": 10,
      "Railhead": 10
    };

    // Initialize feedback message arrays
    let detectionPositiveLocal: string[] = [];
    let detectionNegativeLocal: string[] = [];

    let friendlyBeamWidth = unitDetectionBeamWidth[unit.unit_type] || 0;         // Defaults to 0 if type not listed above
    let friendlySphOfInflu = unitSphereOfInflu[unit.unit_type] || 0;             // Defaults to 0 if type not listed above
    console.log("friendlyBeamWidth = ", friendlyBeamWidth)
    console.log("friendlySphOfInflu = ", friendlySphOfInflu)

    // Adjust FRIENDLY "w" and "A" if role is headquarters or facility or if mobility is fixed 
    if (unit.unit_role === "Headquarters") {
      friendlyBeamWidth *= 1.25     // Increase "w" by 25%
      friendlySphOfInflu *= 0.50   // Decrease "A" by 50%
      detectionPositiveLocal.push("FRIENDLY unit role: headquarters");
      console.log("FRIENDLY w and A changed due to unit being 'Headquarters'")
      console.log("friendlyBeamWidth = ", friendlyBeamWidth, "friendlySphOfInflu = ", friendlySphOfInflu)
    }
    else if (unit.unit_role === "Facility") {
      friendlyBeamWidth *= 1.30     // Increase "w" by 30%
      friendlySphOfInflu *= 0.75   // Decrease "A" by 25%
      detectionPositiveLocal.push("FRIENDLY unit role: facility");
      console.log("FRIENDLY w and A changed due to unit being 'Facility'")
      console.log("friendlyBeamWidth = ", friendlyBeamWidth, "friendlySphOfInflu = ", friendlySphOfInflu)
    }
    if (unit.unit_mobility === "Fixed") {
      friendlySphOfInflu = 5          // Set "A" to 5
      detectionPositiveLocal.push("FRIENDLY unit mobility: fixed");
      console.log("FRIENDLY A changed due to unit being 'fixed'")
      console.log("friendlySphOfInflu = ", friendlySphOfInflu)
    }

    // initialize "t"
    let tFriendly = 1
    // exceptions to inital t value for certain unit types that need to be initialized to 0
    if (unit.unit_type === "Medical Treatment Facility" || unit.unit_type === "Petroleum, Oil and Lubricants" || unit.unit_type === "Sea Port" ){
      tFriendly = 0
    }
    
    // unit readiness affects on "t"
    if (unit.unit_readiness === "Low") {
      tFriendly *= 0.50 // Decrease "t" by 50%
      detectionNegativeLocal.push("FRIENDLY unit readiness: low");
      console.log("tFriendly changed due to low unit readiness")
      console.log("tFriendly = ", tFriendly)
    }
    else if (unit.unit_readiness === "Medium") {
      tFriendly *= 0.85 // Decrease "t" by 15%
      detectionNegativeLocal.push("FRIENDLY unit readiness: medium");
      console.log("tFriendly changed due to medium unit readiness")
      console.log("tFriendly = ", tFriendly)
    }

    // Only ISR and comms answers affect "t" 
    if (currentTacticsData.FriendlyISR === 1) { 
      tFriendly *= 1.25 // Increase "t" by 25%
      detectionPositiveLocal.push("Conducted ISR");
      console.log("tFriendly changed due to FriendlyISR answered yes")
      console.log("tFriendly = ", tFriendly)
    }
    else {
      tFriendly *= 0.75 // Decrease "t" by 25%
      detectionNegativeLocal.push("Did NOT conduct ISR");
      console.log("tFriendly changed due to FriendlyISR answered no")
      console.log("tFriendly = ", tFriendly)
    }
    if (currentTacticsData.FriendlyComms === 0) {
      tFriendly *= 1.25 // Increase "t" by 25%
      detectionPositiveLocal.push("Working comms");
      console.log("tFriendly changed due to FriendlyComms answered yes")
      console.log("tFriendly = ", tFriendly)
    }
    else {
      tFriendly *= 0.75 // Decrease "t" by 25%
      detectionNegativeLocal.push("No comms (jammed)");
      console.log("tFriendly changed due to FriendlyComms answered no")
      console.log("tFriendly = ", tFriendly)
    }

    // Detection phase equation: P = 1 - e^(-(w*t)/(A))
    const friendlyDetectProb = (friendlySphOfInflu > 0)       // ensure not dividing by 0
      ? 1 - Math.exp(-(friendlyBeamWidth * tFriendly) / friendlySphOfInflu)
      : 0;
    console.log("friendlyDetectProb calculated: ", friendlyDetectProb)

    let enemyBeamWidth = unitDetectionBeamWidth[enemyUnit.unit_type] || 0;       // Defaults to 0 if type not listed above
    let enemySphOfInflu = unitSphereOfInflu[enemyUnit.unit_type] || 0;           // Defaults to 0 if type not listed above
    console.log("enemyBeamWidth = ", enemyBeamWidth)
    console.log("enemySphOfInflu = ", enemySphOfInflu)

    // Adjust ENEMY "w" and "A" if role is headquarters or facility or if mobility is fixed 
    if (enemyUnit.unit_role === "Headquarters") {
      enemyBeamWidth *= 1.25     // Increase "w" by 25%
      enemySphOfInflu *= 0.50   // Decrease "A" by 50%
      detectionNegativeLocal.push("ENEMY unit role: headquarters");
      console.log("ENEMY w and A changed due to unit being 'Headquarters'")
      console.log("enemyBeamWidth = ", enemyBeamWidth, "enemySphOfInflu = ", enemySphOfInflu)
    }
    else if (enemyUnit.unit_role === "Facility") {
      enemyBeamWidth *= 1.30     // Increase "w" by 30%
      enemySphOfInflu *= 0.75   // Decrease "A" by 25%
      detectionNegativeLocal.push("ENEMY unit role: facility");
      console.log("ENEMY w and A changed due to unit being 'Facility'")
      console.log("enemyBeamWidth = ", enemyBeamWidth, "enemySphOfInflu = ", enemySphOfInflu)
    }
    if (enemyUnit.unit_mobility === "Fixed") {
      enemySphOfInflu = 5          // Set "A" to 5
      detectionNegativeLocal.push("ENEMY unit mobility: fixed");
      console.log("ENEMY A changed due to unit being 'Fixed'")
      console.log("enemySphOfInflu = ", enemySphOfInflu)
    }

    // initialize "t"
    let tEnemy = 1
    // exceptions to inital t value for certain unit types that need to be initialized to 0
    if (enemyUnit.unit_type === "Medical Treatment Facility" || unit.unit_type === "Petroleum, Oil and Lubricants" || unit.unit_type === "Sea Port" ){
      tEnemy = 0
    }
    
    // unit readiness affects on "t"
    if (enemyUnit.unit_readiness === "Low") {
      tEnemy *= 0.50 // Decrease "t" by 50%
      detectionPositiveLocal.push("ENEMY unit readiness: low");
      console.log("tEnemy changed due to low unit readiness")
      console.log("tEnemy = ", tEnemy)
    }
    else if (enemyUnit.unit_readiness === "Medium") {
      tEnemy *= 0.85 // Decrease "t" by 15%
      detectionPositiveLocal.push("ENEMY unit readiness: medium");
      console.log("tEnemy changed due to medium unit readiness")
      console.log("tEnemy = ", tEnemy)
    }

    // Only ISR and comms answers affect "t" 
    if (currentTacticsData.EnemyISR === 1) { 
      tEnemy *= 1.25 // Increase "t" by 25%
      console.log("tEnemy changed due to EnemyISR answered yes")
      console.log("tEnemy = ", tEnemy)
    }
    else {
      tEnemy *= 0.75 // Decrease "t" by 25%
      console.log("tEnemy changed due to EnemyISR answered no")
      console.log("tEnemy = ", tEnemy)
    }
    if (currentTacticsData.EnemyComms === 1) {
      tEnemy *= 1.25 // Increase "t" by 25%
      console.log("tEnemy changed due to EnemyComms answered yes")
      console.log("tEnemy = ", tEnemy)
    }
    else {
      tEnemy *= 0.75 // Decrease "t" by 25%
      console.log("tEnemy changed due to EnemyComms answered no")
      console.log("tEnemy = ", tEnemy)
    }

    // Detection phase equation: P = 1 - e^(-(w*t)/(A))
    const enemyDetectProb = (enemySphOfInflu > 0)             // ensure not dividing by 0
      ? 1 - Math.exp(-(enemyBeamWidth * tEnemy) / enemySphOfInflu)
      : 0;
    console.log("enemyDetectProb calculated: ", enemyDetectProb)
    setDetectionPositiveFeedback(detectionPositiveLocal.length > 0 ? detectionPositiveLocal.join('\n') : "No significant positive factors.");
    setDetectionNegativeFeedback(detectionNegativeLocal.length > 0 ? detectionNegativeLocal.join('\n') : "No significant negative factors.");
    currentTacticsData.detectionPositiveFeedback = detectionPositiveFeedback;
    currentTacticsData.detectionNegativeFeedback = detectionNegativeFeedback

    if (friendlyDetectProb > enemyDetectProb) {
      setFirstAttackFriendly(true);
      currentTacticsData.firstAttackFriendly = true;
      console.log("Friendly attacks first")
    }
    else {
      // Includes the case where probabilities are equal, granting the defender the ambush
      setFirstAttackFriendly(false);
      currentTacticsData.firstAttackFriendly = false;
      console.log("Enemy attacks first")
    }




    
    // --------------- TARGET ENGAGEMENT PHASE --------------------------------------------------------------------------------------
    // Propbability player hit the target 
    // NOTE: "v" is being used in place of "u" for the target engagement phase equation calculations
    //       "rho" is being used in place of "σ" for the target engagement phase equation calculations

    // Defines the "v" values (unit specific attributes) given by Lt Col Rayl
    const vValue: Record<string, number> = {
      "Infantry": 1,
      "Combined Arms": 1,
      "Armor Company": 2,
      "Field Artillery": 2,
      "Special Operations Forces": 1,
      "Special Operations Forces - EZO": 1,
      "Combat Support": 1,
      // These unit types not currently implemented into current MDL scenario
      "Reconnaissance": 1,
      "Command and Control": 0,
      "Armored Mechanized": 2,
      "Armored Mechanized Tracked": 2,
      "Self-propelled": 2,
      "Electronic Warfare": 0,
      "Signal": 0,
      "Ammunition": 0,
      "Air Defense": 1,
      "Engineer": 1,
      "Air Assault": 1,
      "Medical Treatment Facility": 0,
      "Aviation Rotary Wing": 1,
      "Sustainment": 1,
      "Unmanned Aerial Systems": 1,
      "Combat Service Support": 0,
      "Petroleum, Oil and Lubricants": 0,
      "Sea Port": 0,
      "Railhead": 0
    };

    // Defines the "rho" values (Circular error probability of the attackers weapon) given by Lt Col Rayl
    const unitAccuracyError: Record<string, number> = {
        "Infantry": 8,
        "Combined Arms": 5,
        "Armor Company": 10,
        "Field Artillery": 6,
        "Special Operations Forces": 4, "Special Operations Forces - EZO": 4, 
        "Combat Support": 15,
        // These unit types not currently implemented into current MDL scenario
        "Reconnaissance": 18,
        "Command and Control": 0,
        "Armored Mechanized": 10,
        "Armored Mechanized Tracked": 6,
        "Self-propelled": 6,
        "Electronic Warfare": 0,
        "Signal": 0,
        "Ammunition": 0,
        "Air Defense": 5,
        "Engineer": 15,
        "Air Assault": 5,
        "Medical Treatment Facility": 0,
        "Aviation Rotary Wing": 0,
        "Sustainment": 15,
        "Unmanned Aerial Systems": 4,
        "Combat Service Support": 0,
        "Petroleum, Oil and Lubricants": 0,
        "Sea Port": 0,
        "Railhead": 0
    };

    // Initialize feedback message arrays
    let accuracyPositiveLocal: string[] = [];
    let accuracyNegativeLocal: string[] = [];

    let vFriendly = vValue[unit.unit_type] || 0;                 // Defaults to 0 if type not listed above
    let rhoFriendly = unitAccuracyError[unit.unit_type] || 0;    // Defaults to 0 if type not listed above
    console.log("vFriendly = ", vFriendly)
    console.log("rhoFriendly = ", rhoFriendly)

    // unit readiness affects on "rho"
    if (unit.unit_readiness === "Low") {
      rhoFriendly *= 1.50 // Increase "rho" by 50%
      accuracyNegativeLocal.push("FRIENDLY unit readiness: low")
      console.log("rhoFriendly changed due to low unit readiness")
      console.log("rhoFriendly = ", rhoFriendly)
    }
    else if (unit.unit_readiness === "Medium") {
      rhoFriendly *= 1.15 // Increase "rho" by 15%
      accuracyNegativeLocal.push("FRIENDLY unit readiness: medium")
      console.log("rhoFriendly changed due to medium unit readiness")
      console.log("rhoFriendly = ", rhoFriendly)
    }

    // Only close air support (CAS) and GPA answers affect "rho" 
    if (currentTacticsData.FriendlyCAS === 1) { 
      rhoFriendly *= 0.90 // Decrease "rho" by 10%
      accuracyPositiveLocal.push("Have close air support")
      console.log("rhoFriendly changed due to FriendlyCAS answered yes")
      console.log("rhoFriendly = ", rhoFriendly)
    }
    if (currentTacticsData.FriendlyGPS === 1) {
      rhoFriendly *= 1.30 // Increase "rho" by 30%
      accuracyNegativeLocal.push("No GPS (jammed)")
      console.log("rhoFriendly changed due to FriendlyGPS answered yes")
      console.log("rhoFriendly = ", rhoFriendly)
    }

    // Target engagement phase equation: P_h = 1 - e^(-(u^2)/(2*σ^2))
    if (rhoFriendly > 0) {   // ensure not dividing by 0 or neg
      setFriendlyAccuracyPercent ((1 - Math.exp(-(vFriendly**2) / (2*(rhoFriendly)**2)))*100);
      currentTacticsData.friendlyAccuracyPercent = friendlyAccuracyPercent;
      console.log("friendlyAccuracyPercent calculated:", friendlyAccuracyPercent) 
    }
    else {   // equates to zero if rho is 0 or neg 
      setFriendlyAccuracyPercent(0) 
      currentTacticsData.friendlyAccuracyPercent = friendlyAccuracyPercent;
    }

    // Sorts percentage values into 3 levels
    if (friendlyAccuracyPercent >= 0 && friendlyAccuracyPercent < 22.2222) {
      setFriendlyAccuracyLevel("Low")
      currentTacticsData.friendlyAccuracyLevel = friendlyAccuracyLevel;
      console.log("friendlyAccuracyLevel = ", friendlyAccuracyLevel)
    }
    else if (friendlyAccuracyPercent >= 22.2222 && friendlyAccuracyPercent < 44.4444) {
      setFriendlyAccuracyLevel("Medium")
      currentTacticsData.friendlyAccuracyLevel = friendlyAccuracyLevel;
      console.log("friendlyAccuracyLevel = ", friendlyAccuracyLevel)
    }
    else if (friendlyAccuracyPercent >= 44.4444 && friendlyAccuracyPercent < 66.6667) { // out of all possible unit + tactics combos, can only get up to 65% accuracy
      setFriendlyAccuracyLevel("High")
      currentTacticsData.friendlyAccuracyLevel = friendlyAccuracyLevel;
      console.log("friendlyAccuracyLevel = ", friendlyAccuracyLevel)
    }
    else {
      console.log("Accuracy percent not valid.")
    } 

    

    let vEnemy = vValue[enemyUnit.unit_type] || 0;                    // Defaults to 0 if type not listed above
    let rhoEnemy = unitAccuracyError[enemyUnit.unit_type] || 0;       // Defaults to 0 if type not listed above
    console.log("vEnemy = ", vEnemy)
    console.log("rhoEnemy = ", rhoEnemy)

    // unit readiness affects on "rho"
    if (enemyUnit.unit_readiness === "Low") {
      rhoEnemy *= 1.50 // Increase "rho" by 50%
      accuracyPositiveLocal.push("ENEMY unit readiness: low")
      console.log("rhoEnemy changed due to low unit readiness")
      console.log("rhoEnemy = ", rhoEnemy)
    }
    else if (enemyUnit.unit_readiness === "Medium") {
      rhoEnemy *= 1.15 // Increase "rho" by 15%
      accuracyPositiveLocal.push("ENEMY unit readiness: medium")
      console.log("rhoEnemy changed due to medium unit readiness")
      console.log("rhoEnemy = ", rhoEnemy)
    }

    // Only close air support (CAS) and GPA answers affect "rho" 
    if (currentTacticsData.EnemyCAS === 1) { 
      rhoEnemy *= 0.90 // Decrease "rho" by 10%
      console.log("rhoEnemy changed due to EnemyCAS answered yes")
      console.log("rhoEnemy = ", rhoEnemy)
    }
    if (currentTacticsData.EnemyGPS === 1) {
      rhoEnemy *= 1.30 // Increase "rho" by 30%
      console.log("rhoEnemy changed due to EnemyGPS answered yes")
      console.log("rhoEnemy = ", rhoEnemy)
    }

    // Saves feedback into one variable
    setAccuracyPositiveFeedback(accuracyPositiveLocal.length > 0 ? accuracyPositiveLocal.join('\n') : "No significant positive factors.");
    setAccuracyNegativeFeedback(accuracyNegativeLocal.length > 0 ? accuracyNegativeLocal.join('\n') : "No significant negative factors.");
    currentTacticsData.accuracyPositiveFeedback = accuracyPositiveFeedback;
    currentTacticsData.accuracyNegativeFeedback = accuracyNegativeFeedback;

    
    // Target engagement phase equation: P_h = 1 - e^(-(u^2)/(2*σ^2))
    if (rhoEnemy > 0) {   // ensure not dividing by 0 or neg
      setEnemyAccuracyPercent ((1 - Math.exp(-(vEnemy**2) / (2*(rhoEnemy)**2)))*100);
      currentTacticsData.enemyAccuracyPercent = enemyAccuracyPercent;
      console.log("enemyAccuracyPercent calculated:", enemyAccuracyPercent) 
    }
    else {   // equates to zero if rho is 0 or neg 
      setEnemyAccuracyPercent(0) 
      currentTacticsData.enemyAccuracyPercent = enemyAccuracyPercent;
    }

    // Sorts percentage values into 3 levels
    if (enemyAccuracyPercent >= 0 && enemyAccuracyPercent < 22.2222){
      setEnemyAccuracyLevel("Low")
      currentTacticsData.enemyAccuracyLevel = enemyAccuracyLevel;
      console.log("enemyAccuracyLevel = ", enemyAccuracyLevel)
    }
    else if (enemyAccuracyPercent >= 22.2222 && enemyAccuracyPercent < 44.4444) {
      setEnemyAccuracyLevel("Medium")
      currentTacticsData.enemyAccuracyLevel = enemyAccuracyLevel;
      console.log("enemyAccuracyLevel = ", enemyAccuracyLevel)
    }
    else if (enemyAccuracyPercent >= 44.4444 && enemyAccuracyPercent < 66.6667) { // out of all possible unit + tactics combos, can only get up to 65% accuracy
      setEnemyAccuracyLevel("High")
      currentTacticsData.enemyAccuracyLevel = enemyAccuracyLevel;
      console.log("enemyAccuracyLevel = ", enemyAccuracyLevel)
    }
    else {
      console.log("Accuracy percent not valid.")
    }

    // --------------- DAMAGE ASSESSMENT PHASE --------------------------------------------------------------------------------------
    // This phase defines the damage inflicted, applied to the max damage a unit can inflict 

    let damagePositiveLocal: string[] = [];
    let damageNegativeLocal: string[] = [];

    // Dummy data for enemyscore
    const enemyTotalScore = ((enemyBaseValue * .70) + (Number(calculateEnemyTacticsScore()) * .30));

    // Calculates the total friendly score which is 70% of the base value plue 30% of the tactics value
    const friendlyTotalScore = ((baseValue * .70) + (Number(calculateTacticsScore()) * .30));

    // Checks whether the friendly unit won the engagement or not
    const isWin = friendlyTotalScore > enemyTotalScore;

    // 'r' generates a random number 
    let r = Math.floor(Math.random() * (5 - 0 + 1)) + 0;
    let r_enemy = Math.floor(Math.random() * (5 - 0 + 1)) + 0;

    // let r = rhoFriendly
    // let r_enemy = rhoEnemy
    if (currentTacticsData.FriendlyCritical === 1) {
      r = r * 1.25  // Increase r by 25%
      damagePositiveLocal.push("FRIENDLY defending critical location")
    }
    if (currentTacticsData.EnemyCritical === 1) {
      r_enemy = r_enemy * 1.25 // Increase r_enemy by 25%
    }
    console.log("Friendly rand num (r): ", r);
    console.log("Enemy rand num (r_enemy): ", r_enemy);

    // Initializes 'b' to zero. 'b' is the variable for the range of weapons given for each unit type
    let b = 0;
    let b_enemy = 0;

    // These are based on values given by Lt. Col. Rayl
    if (unit_type === 'Armored Mechanized' || unit_type === 'Armored Mechanized Tracked' || unit_type === 'Field Artillery') {
      b = 20;
    } // add Armor Company b=10
    else if (unit_type === 'Armor Company') {
      b = 10
    }
    else if (unit_type === 'Air Defense') {
      b = 50;
    }
    else if (unit_type === 'Infantry' || unit_type === 'Combined Arms') {
      b = 10; //needs to be 10
    }
    else if (unit_type === 'Reconnaissance' || unit_type === 'Unmanned Aerial Systems') {
      b = 5;
    }
    else if (unit_type === 'Self-propelled' || unit_type === 'Electronic Warfare' || unit_type === 'Air Assault' || unit_type === 'Aviation Rotary Wing' || unit_type === 'Combat Support') {
      b = 15;
    }
    else if (unit_type === 'Signal' || unit_type === 'Special Operations Forces') {
      b = 10;
    } // add multiple special forces types some are b=10 and some are b=15 add MEU and MLR
    else if (unit_type === 'Special Operations Forces - EZO') {
      b = 15;
    }
    else {
      b = 0;
      console.log("Friendly unit type not recognized, WEZ set to 0")
    }

    // Access answers affect b
    if (currentTacticsData.FriendlyAccess === 1) {
      b *= 0.75 // Decrease b by 25%
      damagePositiveLocal.push("Your target is in a good range")
    }

    // These are based on values given by Lt. Col. Rayl
    if (enemyUnit?.unit_type === 'Armored Mechanized' || enemyUnit?.unit_type === 'Armored Mechanized Tracked' || enemyUnit?.unit_type === 'Field Artillery') {
      b_enemy = 10;
    }
    // add armor company
    else if (enemyUnit?.unit_type === 'Armor Company') {
      b_enemy = 10;
    }
    else if (enemyUnit?.unit_type === 'Air Defense') {
      b_enemy = 10;
    }
    else if (enemyUnit?.unit_type === 'Infantry') {
      b_enemy = 10;
    }
    else if (enemyUnit?.unit_type === 'Reconnaissance' || enemyUnit?.unit_type === 'Unmanned Aerial Systems') {
      b_enemy = 10;
    }
    else if (enemyUnit?.unit_type === 'Self-propelled' || enemyUnit?.unit_type === 'Electronic Warfare' || enemyUnit?.unit_type === 'Air Assault' || enemyUnit?.unit_type === 'Aviation Rotary Wing' || enemyUnit?.unit_type === 'Combat Support') {
      b_enemy = 10;
    }
    else if (enemyUnit?.unit_type === 'Signal' || enemyUnit?.unit_type === 'Special Operations Forces') {
      b_enemy = 10;
    } // add multiple special forces types some are b=10 and some are b=15 add MEU and MLR
    else if (enemyUnit?.unit_type === 'Special Operations Forces - EZO') {
      b = 15;
    }
    else {
      b_enemy = 0;
      console.log("Enemy unit type not recognized, WEZ set to 0")
    }

    // Access answers affect b
    if (currentTacticsData.EnemyAccess === 1) {
      b_enemy *= 0.75 // Decrease b by 25%
    }

    setDamagePositiveFeedback(damagePositiveLocal.length > 0 ? damagePositiveLocal.join('\n') : "No significant positive factors.");
    setDamageNegativeFeedback(damageNegativeLocal.length > 0 ? damageNegativeLocal.join('\n') : "No significant negative factors.");
    currentTacticsData.damagePositiveFeedback = damagePositiveFeedback;
    currentTacticsData.damageNegativeFeedback = damageNegativeFeedback; 

    // Calculates the damage previously done to the friendly unit
    let prevFriendlyDamage
    if (b > 0 && calculateEnemyTacticsScore() > 0) {
      // Friendly damage assessment phase calculations ------------------------------------------------------------------------------
      prevFriendlyDamage = Math.exp(-((r ** 2) / (2 * ((b_enemy * (calculateEnemyTacticsScore() / 100)) ** 2))));
      console.log("Enemy tactics score (calculateEnemyTacticsScore): ", calculateEnemyTacticsScore())
    }
    else {
      prevFriendlyDamage = 0;
      console.log("calculateEnemyTacticsScore = 0")
      console.log("Enemy tactics score (calculateEnemyTacticsScore): ", calculateEnemyTacticsScore())
    }

    // Calculates the maximum damage that the friendly striking unit can inflict in a particular engagement
    let maxFriendlyDamage = .5 * Number(enemyUnit?.unit_health);

    // Friendly example damage assessment -------------------------------------------------------------------------------------------
    let friendlyDamage = maxFriendlyDamage * prevFriendlyDamage;
    console.log("First friendly damage: ", friendlyDamage)
    console.log("Friendly Health: ", Number(friendlyHealth))
    if (Number(friendlyHealth) < friendlyDamage) {
      friendlyDamage = Number(friendlyHealth);
    }
    console.log("Second friendly damage: ", friendlyDamage)


    // Calculates the overall damage to the friendly unit
    setTotalFriendlyDamage(friendlyDamage);
    currentTacticsData.friendlyDamage = totalFriendlyDamage;
    console.log("total friendly damage: ", totalFriendlyDamage);

    // Friendly attrition calculation: Fn = Fi - D ----------------------------------------------------------------------------------
    // Subtracts the total damage from the previous friendly health in order to set a new health for the friendly unit
    setFriendlyHealth(Math.round((Number(friendlyHealth)) - friendlyDamage));

    // Calculates the maximum damage that the enemy striking unit can inflict in a particular engagement
    let maxEnemyDamage = .5 * Number(unit_health);

    let prevEnemyDamage = 0;
    // Calculates the damage previously done to the enemy unit
    if (b > 0 && calculateTacticsScore() > 0) {
      // Enemy damage assessment phase calculations ---------------------------------------------------------------------------------
      prevEnemyDamage = Math.exp(-((r_enemy ** 2) / (2 * ((b * (calculateTacticsScore() / 100)) ** 2))));
      console.log("Friendly tactics score (calculateTacticsScore): ", calculateTacticsScore())
    }
    else {
      prevEnemyDamage = 0;
      console.log("calculateTacticsScore = 0")
      console.log("Friendly tactics score (calculateTacticsScore): ", calculateTacticsScore())
    }

    // Make sure enemy health is never negative
    // Enemy example damage assessment ----------------------------------------------------------------------------------------------
    let enemyDamage = maxEnemyDamage * prevEnemyDamage;
    console.log("First enemy damage: ", enemyDamage)
    console.log("Enemy Health: ", enemyHealth)
    if (enemyHealth < enemyDamage) {
      enemyDamage = enemyHealth;
    }
    console.log("Second enemy damage: ", enemyDamage)

    // // Calculates the overall damage to the enemy unit and sets it to the totalEnemyDamage variable
    setTotalEnemyDamage(enemyDamage);
    currentTacticsData.enemyDamage = totalEnemyDamage;
    console.log("total enemy damage: ", totalEnemyDamage);

    // Enemy attrition calculation: Fn = Fi - D -------------------------------------------------------------------------------------
    // Subtracts the total damage from the previous enemy health in order to set a new health for the enemy unit
    setEnemyHealth(Math.round((Number(enemyHealth)) - enemyDamage));

    // Calls the function that calculates the score for each unit and sets the score as finalized
    const friendlyScore = calculateTacticsScore();
    setTacticsScore(friendlyScore);
    const enemyScore = calculateEnemyTacticsScore();
    setEnemyTacticsScore(enemyScore);

    const answersForThisRound: Form[] = [
      { 
        ID: 'Conducted ISR prior to moving land forces?', 
        friendlyScore: weights.ISR[question1.toLowerCase() as 'yes' | 'no'], 
        enemyScore: weights.ISR[enemyquestion1.toLowerCase() as 'yes' | 'no'],
        friendlyAnswer: question1 as 'Yes' | 'No',
        enemyAnswer: enemyquestion1 as 'Yes' | 'No'
      },
      { 
        ID: 'Within logistics support range?', 
        friendlyScore: weights.logisticsSupportRange[question2.toLowerCase() as 'yes' | 'no'], 
        enemyScore: weights.logisticsSupportRange[enemyquestion2.toLowerCase() as 'yes' | 'no'],
        friendlyAnswer: question2 as 'Yes' | 'No',
        enemyAnswer: enemyquestion2 as 'Yes' | 'No'
      },
      { 
        ID: 'Is the target defending a critical location?', 
        friendlyScore: weights.criticalLocation[question3.toLowerCase() as 'yes' | 'no'], 
        enemyScore: weights.criticalLocation[enemyquestion3.toLowerCase() as 'yes' | 'no'],
        friendlyAnswer: question3 as 'Yes' | 'No',
        enemyAnswer: enemyquestion3 as 'Yes' | 'No'
      },
      { 
        ID: 'GPS being jammed?', 
        friendlyScore: weights.gpsJammed[question4.toLowerCase() as 'yes' | 'no'], 
        enemyScore: weights.gpsJammed[enemyquestion4.toLowerCase() as 'yes' | 'no'],
        friendlyAnswer: question4 as 'Yes' | 'No',
        enemyAnswer: enemyquestion4 as 'Yes' | 'No'
      },
      { 
        ID: 'Communications being jammed?', 
        friendlyScore: weights.communicationsJammed[question5.toLowerCase() as 'yes' | 'no'], 
        enemyScore: weights.communicationsJammed[enemyquestion5.toLowerCase() as 'yes' | 'no'],
        friendlyAnswer: question5 as 'Yes' | 'No',
        enemyAnswer: enemyquestion5 as 'Yes' | 'No'
      },
      { 
        ID: 'Have close air support?', 
        friendlyScore: weights.closeAirSupport[question6.toLowerCase() as 'yes' | 'no'], 
        enemyScore: weights.closeAirSupport[enemyquestion6.toLowerCase() as 'yes' | 'no'],
        friendlyAnswer: question6 as 'Yes' | 'No',
        enemyAnswer: enemyquestion6 as 'Yes' | 'No'
      },
      { 
        ID: 'Is the target accessible?', 
        friendlyScore: weights.accessTarget[question7.toLowerCase() as 'yes' | 'no'], 
        enemyScore: weights.accessTarget[enemyquestion7.toLowerCase() as 'yes' | 'no'],
        friendlyAnswer: question7 as 'Yes' | 'No',
        enemyAnswer: enemyquestion7 as 'Yes' | 'No'
      }
    ];
    setSubmittedAnswers(answersForThisRound);

    setRound(round + 1); // Updates the round as the scores are finalized

    console.log("FriendlyID: ", unit_id);

    // Prepare data for engagement and tactics
    const engagementData = {
      SectionID: userSection,
      FriendlyID: unit_id,
      EnemyID: enemyUnit?.unit_id,
      FriendlyBaseScore: baseValue,
      EnemyBaseScore: enemyBaseValue,
      FriendlyTacticsScore: friendlyScore,
      EnemyTacticsScore: enemyScore,
      FriendlyTotalScore: friendlyTotalScore,
      EnemyTotalScore: enemyTotalScore,
      isWin: isWin,
    };

    // Submit answers to backend
    try {
      // Submit engagement data
      const engagementResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/engagements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(engagementData),
      });

      if (!engagementResponse.ok) {
        throw new Error('Failed to create engagement');
      }

      const engagementResult = await engagementResponse.json();
      console.log('Engagement created:', engagementResult);
      currentTacticsData.engagementid = engagementResult.engagementid;

      // Submit tactics data
      const tacticsResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/tactics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentTacticsData),
      });

      if (!tacticsResponse.ok) {
        throw new Error('Failed to record tactics');
      }

      const tacticsResult = await tacticsResponse.json();
      console.log('Tactics recorded:', tacticsResult);

    } catch (error) {
      console.error('Error submitting data:', error);
    }

    // Save health
    console.log("Saving health (friendly, enemy): ", Math.round(friendlyHealth - friendlyDamage), " ", Math.round(enemyHealth - enemyDamage))
    updateUnitHealth(Number(unit_id), Math.round(friendlyHealth - friendlyDamage));
    updateUnitHealth(Number(enemyUnit?.unit_id), Math.round(enemyHealth - enemyDamage));

  }; // End of finalize tactics

  // This is the intervale for the Finalize Tactics button animation
  const interval = useInterval(
    () =>
      setProgress((current) => {
        if (current < 100) {
          return current + 1;
        }

        interval.stop();
        setLoaded(true);

        nextStep();

        return 0;
      }),
    40
  );

  // Variable Conditions and corresponding weights
  const weights: Record<WeightKeys, { yes: number; no: number }> = {
    ISR: { yes: 20, no: 0 },
    logisticsSupportRange: { yes: 25, no: 0 },
    criticalLocation: { yes: 10, no: 0 },
    gpsJammed: { yes: 0, no: 10 },
    communicationsJammed: { yes: 0, no: 10 },
    closeAirSupport: { yes: 15, no: 0 },
    accessTarget: { yes: 10, no: 0 }
  };

  // Defines the keys for the different tactics to assign to different weights
  type WeightKeys = 'ISR' | 'logisticsSupportRange' | 'criticalLocation' | 'gpsJammed' | 'communicationsJammed' | 'closeAirSupport' | 'accessTarget';

  // Calculates the score based on different tactics for each engagement
  const calculateTacticsScore = () => {
    let score = 0;

    // Calculate score based on current state values of questions
    score += weights.ISR[question1.toLowerCase() as 'yes' | 'no'];
    score += weights.logisticsSupportRange[question2.toLowerCase() as 'yes' | 'no'];
    score += weights.criticalLocation[question3.toLowerCase() as 'yes' | 'no'];
    score += weights.gpsJammed[question4.toLowerCase() as 'yes' | 'no'];
    score += weights.communicationsJammed[question5.toLowerCase() as 'yes' | 'no'];
    score += weights.closeAirSupport[question6.toLowerCase() as 'yes' | 'no'];
    score += weights.accessTarget[question7.toLowerCase() as 'yes' | 'no'];

    return score;
  };

  // Calculates the score based on different tactics for each engagement
  const calculateEnemyTacticsScore = () => {
    let score = 0;

    // Calculate score based on current state values of questions
    score += weights.ISR[enemyquestion1.toLowerCase() as 'yes' | 'no'];
    score += weights.logisticsSupportRange[enemyquestion2.toLowerCase() as 'yes' | 'no'];
    score += weights.criticalLocation[enemyquestion3.toLowerCase() as 'yes' | 'no'];
    score += weights.gpsJammed[enemyquestion4.toLowerCase() as 'yes' | 'no'];
    score += weights.communicationsJammed[enemyquestion5.toLowerCase() as 'yes' | 'no'];
    score += weights.closeAirSupport[enemyquestion6.toLowerCase() as 'yes' | 'no'];
    score += weights.accessTarget[enemyquestion7.toLowerCase() as 'yes' | 'no'];

    //score = ((20 * Number(unitTactics?.awareness)) + (25 * Number(unitTactics?.logistics) + (10 * Number(unitTactics?.ISR)) + (10 * Number(unitTactics?.gps)) +
      //(10 * Number(unitTactics?.comms)) + (15 * Number(unitTactics?.fire)) + (10 * Number(unitTactics?.pattern))));
    return score;
  };

  // Maps each tactic and its corresponding blue/red score to a row
  const tacticToRow = (answersForThisRound: Form[]) => (
    answersForThisRound.map((tactic) => (
      <Table.Tr key={tactic.ID}>
        <Table.Td>{tactic.ID}</Table.Td>
        <Table.Td>{tactic.friendlyAnswer}</Table.Td>
        <Table.Td>{tactic.enemyAnswer}</Table.Td>
      </Table.Tr>
    ))

  );

  // Sets value of readiness bar in inital display based on readiness level that is initialized
  const getReadinessProgress = (unit_readiness: string | undefined) => {
    switch (unit_readiness) {
      case 'Untrained':
        return 0;
      case 'Low':
        return 25;
      case 'Medium':
        return 50;
      case 'High':
        return 75;
      case 'Elite':
        return 100;
      default:
        return <div>Error: Invalid Force Readiness</div>
    }
  }

  // Sets value of skill bar in intial display based on skill level thtat is intialized
  const getForceSkill = (unit_skill: string | undefined) => {
    switch (unit_skill) {
      case 'Untrained':
        return 0;
      case 'Basic':
        return 33;
      case 'Advanced':
        return 66;
      case 'Elite':
        return 100;
      default:
        return <div>Error: Invalid Force Skill</div>
    }
  }


  // Sets color of Force Readiness bar on the initial engagement page based on initialized readiness value
  const CustomProgressBarReadiness = ({ value }: { value: number }) => {
    let color = 'blue';

    // Set color based on value for readiness
    if (value === 0) {
      color = 'red';
    }
    else if (value <= 25) {
      color = 'orange';
    }
    else if (value <= 50) {
      color = 'yellow';
    }
    else if (value <= 75) {
      color = 'lime';
    }
    else {
      color = 'green';
    }

    return (
      <Group grow gap={5} mb="xs">
        <Progress
          size="xl"
          color={color}
          value={value > 0 ? 100 : 0}
          transitionDuration={0}
        />
        <Progress size="xl" color={color} transitionDuration={0} value={value < 30 ? 0 : 100} />
        <Progress size="xl" color={color} transitionDuration={0} value={value < 50 ? 0 : 100} />
        <Progress size="xl" color={color} transitionDuration={0} value={value < 70 ? 0 : 100} />
      </Group>
    );
  };

  // Sets color of the Force Skill bar on the initial engagement page based on initialized skill value
  const CustomProgressBarSkill = ({ value }: { value: number }) => {
    let color = 'blue';

    // Set color based on value for readiness
    if (value === 0) {
      color = 'red';
    }
    else if (value <= 50) {
      color = 'yellow';
    }
    else {
      color = 'green';
    }

    return (
      <Group grow gap={5} mb="xs">
        <Progress
          size="xl"
          color={color}
          value={value > 0 ? 100 : 0}
          transitionDuration={0}
        />
        <Progress size="xl" color={color} transitionDuration={0} value={value < 30 ? 0 : 100} />
        <Progress size="xl" color={color} transitionDuration={0} value={value < 50 ? 0 : 100} />
        <Progress size="xl" color={color} transitionDuration={0} value={value < 70 ? 0 : 100} />
      </Group>
    );
  };

  // Sets color of the Unit Health bar on the initial engagement page based on the initialized health value
  // Color may change after each round as each unit's health decreases
  const CustomProgressBarHealth = ({ value }: { value: number }) => {
    let color = 'blue';

    // Set color based on value for readiness
    if (value <= 25) {
      color = 'red';
    }
    else if (value <= 50) {
      color = 'orange';
    }
    else if (value <= 75) {
      color = 'yellow';
    }
    else {
      color = 'green';
    }

    return (
      <Progress value={value} color={color} size={'xl'} mb='xs' />
    );
  };

  // const displayWinner = (friendlyHealth: number, enemyHealth: number): string => {
  //   if (friendlyHealth <= 0 || enemyHealth <= 0) {
  //     return friendlyHealth > enemyHealth ? 'Friendly Won' : 'Enemy Won';
  //   }
  //   return 'Round Summary';
  // };


  // Checks that there is a unit to run an engagement
  const unitNull = () => {
    if (unit_id !== undefined) {
      return true;
    }
  }

  //check to see if the enemy with a specific enemy id is in the FriendlyForce WEZ
  const checkWEZ = async (enemyID: number): Promise<boolean> => {
    if(!selectedUnit) return false;
    try {
      // Send a GET request to the backend API endpoint /api/withinWEZ
      // Pass enemyID and friendlyID as query parameters
      let enemyInWEZ = false;
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/withinWEZ`, {
        params: {
          enemyid: enemyID, // ID of the enemy unit being checked
          friendlyid: selectedUnit  // ID of the friendly unit
        }
      });
      // Destructure the enemyInWEZ property from the response data
      ({ enemyInWEZ } = response.data);
      return enemyInWEZ;

    } catch (error) {
      console.error('Error calculating WEZ:', error);
      // If there's an error, return false as a fallback
      return false;
    }
  };

  // Starts the battle page if a unit has been selected
  if (isLoadingUnits) {
    return <Text>loading...</Text>
    
  }
  if (!unit) {
    navigate('/')
    return <Text>redirected due to fetching error</Text>
  }

  return (
    <MantineProvider defaultColorScheme='dark'>
      <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false} style={{ padding: '20px' }}>
        <Stepper.Step allowStepSelect={false} icon={<IconSwords stroke={1.5} style={{ width: rem(27), height: rem(27) }} />}>
          <h1 style={{ justifyContent: 'center', display: 'flex', alignItems: 'center' }}>Round {round}</h1>
          <div>
            <Grid justify='center' align='flex-start' gutter={100}>
              <Grid.Col span={4}>
                <Card withBorder radius="md" className={classes.card} >
                  <Card.Section className={classes.imageSection} mt="md" >
                    {/* Military icon for the selected friendly unit */}
                    <Group>
                      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                        <Image
                          src={getImageSRC((unit_type ?? '').toString(), true)}
                          height={160}
                          style={{ width: 'auto', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </div>
                    </Group>
                  </Card.Section>

                  {/* Displays a card that contains pertinent information about the selected friendly unit */}
                  <Card.Section><Center><h2>{unit_name}</h2></Center></Card.Section>
                  {unit ? (
                    <div style={{ fontSize: 'var(--mantine-font-size-xl)', whiteSpace: 'pre-line' }}>
                      <strong>Type:</strong> {unit_type}<br />
                      <Space mb="5px" />
                      <strong>Unit Size:</strong> {unit_size}<br />
                      <Space mb="5px" />
                      <strong>Force Mobility:</strong> {unit_mobility}<br />
                      <Space mb="5px" />

                      <strong>Force Readiness:</strong> {unit_readiness}<br />
                      <CustomProgressBarReadiness value={Number(getReadinessProgress(unit_readiness))} />

                      <strong>Force Skill:</strong> {unit_skill}<br />
                      <CustomProgressBarSkill value={Number(getForceSkill((unit_skill)))} />

                      <strong>Health:</strong> {friendlyHealth}<br />
                      <CustomProgressBarHealth value={Number(friendlyHealth)} />
                    </div>
                  ) : (
                    <Text size="sm">Unit not found</Text>
                  )}
                </Card>
              </Grid.Col>


              {/* Displays a card that contains pertinent information about the selected enemy unit */}
              <Grid.Col span={4}>
                {enemyUnit ? (
                  <Card withBorder radius="md" className={classes.card} >
                    <Card.Section className={classes.imageSection} mt="md">
                      {/* Military icon for the selected enemy unit */}

                      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                        <Image
                          src={getImageSRC((enemyUnit?.unit_type ?? '').toString(), false)}
                          height={160}
                          style={{ width: 'auto', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      </div>

                    </Card.Section>

                    <Card.Section><Center><h2>{enemyUnit.unit_name}</h2></Center></Card.Section>
                    {unit ? (
                      <div style={{ fontSize: 'var(--mantine-font-size-xl)' }}>
                        <strong>Type:</strong> {enemyUnit.unit_type}<br />
                        <Space mb="5px" />
                        <strong>Unit Size:</strong> {enemyUnit.unit_size}<br />
                        <Space mb="5px" />
                        <strong>Force Mobility:</strong> {enemyUnit.unit_mobility}<br />
                        <Space mb="5px" />

                        <strong>Force Readiness:</strong> {enemyUnit.unit_readiness}<br />
                        <CustomProgressBarReadiness value={Number(getReadinessProgress(enemyUnit.unit_readiness))} />

                        <strong>Force Skill:</strong> {enemyUnit.unit_skill}<br />
                        <CustomProgressBarSkill value={Number(getForceSkill((enemyUnit.unit_skill)))} />

                        <strong>Health:</strong> {enemyHealth}<br />
                        <CustomProgressBarHealth value={Number(enemyHealth)} />

                      </div>
                    ) : (
                      <Text size="sm">Unit not found</Text>
                    )}
                  </Card>
                )
                  :
                  // Drop down menu to select the proper enemy unit to begin an engagement with
                  (
                    enemyWithinWEZ.length === 0 ? (
                      <h2>No enemy units to select</h2>
                    ) : (
                      <Select
                        label="Select Enemy Unit"
                        placeholder="Select Enemy Unit"
                        data={enemyWithinWEZ.map(eUnit => ({ value: eUnit.unit_id.toString(), label: eUnit.unit_name }))}
                        searchable
                        value={enemyUnit}
                        onChange={handleSelectEnemy}
                      />
                    )
                  )}
              </Grid.Col>
            </Grid>

            {/* Buttons to start and engagement or deselect the previously selected enemy unit */}
            <Group justify="center" mt="xl">
              {(!inEngagement && enemyUnit) ?
                (<Button onClick={handleDeselectEnemy} disabled={enemyUnit ? false : true} color='red'>Deselect Enemy Unit</Button>) :
                (<></>)
              }
              <Button onClick={handleStartEngagement} disabled={enemyUnit ? false : true}>{inEngagement ? 'Start Round' : 'Start Engagement'}</Button>
            </Group>
          </div>
        </Stepper.Step>

        {/* This begins the yes/no pages for the students to answer about individual tactics*/}
        {/* Phase 1 questions about awareness (ISR) and logistics support */}
        <Stepper.Step allowStepSelect={false} label="Force Strength" icon={<IconNumber1Small stroke={1.5} style={{ width: rem(80), height: rem(80) }} />}>
          <div>
            <p>Phase 1: Force Strength</p>
            <Grid>
              <Grid.Col span={4}>
                <h1>Friendly: {unit_name}</h1>
                <p>Conducted ISR prior to moving land forces?</p>
                <SegmentedControl value={question1} onChange={setQuestion1} size='xl' radius='xs' color="gray" data={['Yes', 'No']} />
                <p>Within logistics support range?</p>
                <SegmentedControl value={question2} onChange={setQuestion2} size='xl' radius='xs' color="gray" data={['Yes', 'No']} />
              </Grid.Col>
              <Grid.Col span={6}>
                <h1>Enemy: {enemyUnit?.unit_name}</h1>
                <p>Conducted ISR prior to moving land forces?</p>
                <SegmentedControl
                  value={enemyquestion1}
                  onChange={setEnemyQuestion1}
                  size='xl'
                  radius='xs'
                  color="gray"
                  data={['Yes', 'No']}
                />
                <p>Within logistics support range?</p>
                <SegmentedControl
                  value = {enemyquestion2}
                  onChange={setEnemyQuestion2}
                  size='xl'
                  radius='xs'
                  color="gray"
                  data={['Yes', 'No']}
                />
              </Grid.Col>
            </Grid>

            {/* Button to continue to the next page */}
            <Group justify="center" mt="xl">
              <Button onClick={nextStep}>Continue</Button>
            </Group>

          </div>
        </Stepper.Step>

        {/* Phase 2 questions about target defense and GPS*/}
        <Stepper.Step allowStepSelect={false} label="Tactical Advantage" icon={<IconNumber2Small stroke={1.5} style={{ width: rem(80), height: rem(80) }} />}>
          <div>
            <p>Phase 2: Tactical Advantage</p>
            <Grid>
              <Grid.Col span={6}>
                <h1>Friendly: {unit_name}</h1>
                <p>Is the target defending a critical location?</p>
                <SegmentedControl value={question3} onChange={setQuestion3} size='xl' radius='xs' color="gray" data={['Yes', 'No']} />
                <p>GPS being jammed?</p>
                <SegmentedControl value={question4} onChange={setQuestion4} size='xl' radius='xs' color="gray" data={['Yes', 'No']} />
              </Grid.Col>
              <Grid.Col span={6}>
                <h1>Enemy: {enemyUnit?.unit_name}</h1>
                <p>Is the target defending a critical location?</p>
                <SegmentedControl
                  value={enemyquestion3}
                  onChange={setEnemyQuestion3}
                  size='xl'
                  radius='xs'
                  color="gray"
                  data={['Yes', 'No']}
                />
                <p>GPS being jammed?</p>
                <SegmentedControl
                  value={enemyquestion4}
                  onChange={setEnemyQuestion4}
                  size='xl'
                  radius='xs'
                  color="gray"
                  data={['Yes', 'No']}
                />
              </Grid.Col>
            </Grid>

            {/* Separate buttons to continue or return to previous page */}
            <Group justify="center" mt="xl">
              <Button onClick={prevStep}>Go Back</Button>
              <Button onClick={nextStep}>Next Phase</Button>
            </Group>
          </div>
        </Stepper.Step>

        {/* Phase 3 questions about communications and close air support (CAS) */}
        <Stepper.Step allowStepSelect={false} label="Fire Support" icon={<IconNumber3Small stroke={1.5} style={{ width: rem(80), height: rem(80) }} />} >
          <div>
            <p>Phase 3: Fire Support</p>
            <Grid>
              <Grid.Col span={6}>
                <h1>Friendly: {unit_name}</h1>
                <p>Communications being jammed?</p>
                <SegmentedControl value={question5} onChange={setQuestion5} size='xl' radius='xs' color="gray" data={['Yes', 'No']} />
                <p>Have close air support?</p>
                <SegmentedControl value={question6} onChange={setQuestion6} size='xl' radius='xs' color="gray" data={['Yes', 'No']} />
              </Grid.Col>
              <Grid.Col span={6}>
                <h1>Enemy: {enemyUnit?.unit_name}</h1>
                <p>Communications being jammed?</p>
                <SegmentedControl
                  value={enemyquestion5}
                  onChange={setEnemyQuestion5}
                  size='xl'
                  radius='xs'
                  color="gray"
                  data={['Yes', 'No']}
                />
                <p>Have close air support?</p>
                <SegmentedControl
                  value={enemyquestion6}
                  onChange={setEnemyQuestion6}
                  size='xl'
                  radius='xs'
                  color="gray"
                  data={['Yes', 'No']}
                />
              </Grid.Col>
            </Grid>

            {/* Separate buttons to go back or continue to the next page */}
            <Group justify="center" mt="xl">
              <Button onClick={prevStep}>Go Back</Button>
              <Button onClick={nextStep}>Next Phase</Button>
            </Group>
          </div>
        </Stepper.Step>

        {/* Phase 4 question about the unit being accessible by a pattern force */}
        <Stepper.Step allowStepSelect={false} label="Terrain" icon={<IconNumber4Small stroke={1.5} style={{ width: rem(80), height: rem(80) }} />}>
          <div>
            <p>Phase 4: Terrain</p>
            <Grid>
              <Grid.Col span={6}>
                <h1>Friendly: {unit_name}</h1>
                <p>Is the target accessible?</p>
                <SegmentedControl value={question7} onChange={setQuestion7} size='xl' radius='xs' color="gray" data={['Yes', 'No']} disabled={progress !== 0} />
              </Grid.Col>
              <Grid.Col span={6}>
                <h1>Enemy: {enemyUnit?.unit_name}</h1>
                <p>Is the target accessible?</p>
                <SegmentedControl
                  value={enemyquestion7}
                  onChange={setEnemyQuestion7}
                  size='xl'
                  radius='xs'
                  color="gray"
                  data={['Yes', 'No']}
                />
              </Grid.Col>
            </Grid>
            <Group justify="center" mt="xl">

              {/* Button to go back */}
              <Button onClick={prevStep} disabled={progress !== 0}>Go Back</Button>

              {/* Finalize Score button that includes a animated progress bar to visually slow down the calculations to the cadet*/}
              <Button
                className={classes.button}
                onClick={() => {
                  if (!interval.active) {
                    interval.start();
                  }
                  finalizeTactics();
                }}
                color={theme.primaryColor}
                disabled={progress !== 0} // Disable the button during loading
              >
                <div className={classes.label}>
                  {progress !== 0 ? 'Calculating Scores...' : loaded ? 'Complete' : 'Finalize Tactics'}
                </div>

                {progress !== 0 && (
                  <Progress
                    style={{ height: '100px', width: '200px' }}
                    value={progress}
                    className={classes.progress}
                    color={rgba(theme.colors.blue[2], 0.35)}
                    radius="0px"
                  />
                )}
              </Button>

            </Group>
          </div>
        </Stepper.Step>
        {/* End of yes/no questions for cadets */}

        {/* AAR PAGE */}
        {/* Displays the round summary page with comparisons between friendly and enemy units */}
        <Stepper.Step allowStepSelect={false} icon={<IconHeartbeat stroke={1.5} style={{ width: rem(35), height: rem(35) }} />}>
          <div>
            {/*  style={{backgroundColor: 'yellow'}} */}
            {/* <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{((Number(friendlyHealth) <= 0) || (Number(enemyHealth) <= 0)) ? displayWinner(Number(friendlyHealth), Number(enemyHealth)) : 'Round ' + (round - 1) + ' After Action Review'}</h1> */}

            <Group justify="center" mt="xl" display={'flex'}>
              <Card shadow="sm" padding="md" radius="md" withBorder style={{ width: '600px', textAlign: 'center' }} display={'flex'}>
                <Card.Section withBorder inheritPadding py="xs">
                  <div style={{ textAlign: 'center' }}>
                    <h2>{((Number(friendlyHealth) <= 0) || (Number(enemyHealth) <= 0)) ? 'Final After Action Review' : 'Round After Action Review'}</h2>
                  </div>
                </Card.Section>

                <Card.Section withBorder inheritPadding py="xs">
                  <Container>
                    <Text size="xl" fw={700}>Damage</Text>
                  </Container>

                  {/* Friendly Damage Bar */}
                  <Grid >
                    <Grid.Col span={2} style={{ display: 'flex', alignItems: 'center' }}>
                      <Text size="sm">{unit_name}</Text>
                    </Grid.Col>

                    <Grid.Col span={10}>
                      <Tooltip
                        color="gray"
                        position="bottom"
                        transitionProps={{ transition: 'fade-up', duration: 400 }}
                        label={"Damage: " + Math.round(Number(totalFriendlyDamage)) + ", Remaining: " + friendlyHealth}
                      >
                        <Progress.Root size={30} classNames={{ label: classes.progressLabel }} m={10}>
                          {friendlyHealth > 0 ? (
                            <>
                              <Progress.Section value={friendlyHealth} color={'#3d85c6'} key={'remaining'}>
                                {(totalFriendlyDamage === 0 || !totalFriendlyDamage) ? 'No Damage' : ''}
                              </Progress.Section>

                              <Progress.Section value={Number(totalFriendlyDamage)} color={'#2b5d8b'} key={'taken'}>
                                {'-' + Number(totalFriendlyDamage).toFixed(0)}
                              </Progress.Section>
                            </>
                          ) : (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                width: '100%',
                              }}
                            >
                              FATAL
                            </div>
                          )}
                        </Progress.Root>

                      </Tooltip>
                    </Grid.Col>

                  </Grid>

                  {/* Enemy Damage Bar */}
                  <Grid >
                    <Grid.Col span={2} style={{ display: 'flex', alignItems: 'center' }}>
                      <Text size="sm">{enemyUnit?.unit_name}</Text>
                    </Grid.Col>

                    <Grid.Col span={10}>
                      <Tooltip
                        color="gray"
                        position="bottom"
                        transitionProps={{ transition: 'fade-up', duration: 400 }}
                        label={"Damage: " + Math.round(totalEnemyDamage) + ", Remaining: " + enemyHealth}
                      >
                        <Progress.Root size={30} classNames={{ label: classes.progressLabel }} m={10}>
                          {enemyHealth > 0 ? (
                            <>
                              <Progress.Section value={enemyHealth} color={'#c1432d'} key={'remaining'}>
                                {totalEnemyDamage === 0 ? 'No Damage' : ''}
                              </Progress.Section>

                              <Progress.Section value={Number(totalEnemyDamage)} color={'#872f1f'} key={'taken'}>
                                {'-' + Number(totalEnemyDamage).toFixed(0)}
                              </Progress.Section>
                            </>
                          ) : (
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                width: '100%'
                              }}
                            >
                              FATAL
                            </div>
                          )}
                        </Progress.Root>

                      </Tooltip>
                    </Grid.Col>
                  </Grid>
                </Card.Section>


                <Card.Section withBorder inheritPadding py="xs">
                  <Container>
                    <Text size="xl" fw={700}>Tactics</Text>
                  </Container>

                  {/* Displays a table with the scoring of each tactic of both friendly and enemy units */}
                  <Table verticalSpacing={'xs'} style={{ justifyContent: 'center' }}>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th style={{ textAlign: 'center' }}>Tactic</Table.Th>
                        <Table.Th style={{ color: '#60acf7', textAlign: 'center' }}>Friendly Tactic</Table.Th>
                        <Table.Th style={{ color: '#f4888a', textAlign: 'center' }}>Enemy Tactic</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>{submittedAnswers ? tacticToRow(submittedAnswers) : null}</Table.Tbody>
                  </Table>
                </Card.Section>

                <Card.Section withBorder inheritPadding py="xs">
                  {/* feedback section */}
                  <Container>
                    <Text size="xl" fw={700}>Tactics Feedback & Effects</Text>
                  </Container>

                  {/* feedback table */}
                  <Table verticalSpacing={'xs'} style={{ justifyContent: 'center', width: "100%" }} >
                    {/* headers */}
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th style={{ textAlign: 'center', width: '34%' }}>Detection</Table.Th>
                        <Table.Th style={{ textAlign: 'center', width: '33%' }}>Accuracy</Table.Th>
                        <Table.Th style={{ textAlign: 'center', width: '33%' }}>Damage</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {/* Row 1: Text Feedback */}
                      <Table.Tr>
                        {/* detection */}
                        <Table.Td>
                          <Text c={firstAttackFriendly ? '#60acf7' : '#f4888a'}>
                            {firstAttackFriendly ? 'You surprised the enemy and attacked first!' : 'Enemy surprised you and attacked first!'}
                          </Text>
                        </Table.Td>
                        {/* accuracy */}
                        <Table.Td>
                          <Text c="#60acf7">{friendlyAccuracyLevel}, {friendlyAccuracyPercent.toFixed(2)}%</Text>
                          <Text c="#f4888a">{enemyAccuracyLevel}, {enemyAccuracyPercent.toFixed(2)}%</Text>
                        </Table.Td>
                        {/* damage */}
                        <Table.Td>
                          <Text c="#60acf7">-{totalFriendlyDamage.toFixed(0)} points</Text>
                          <Text c="#f4888a">-{totalEnemyDamage.toFixed(0)} points</Text>
                        </Table.Td>
                      </Table.Tr>

                      {/* Row 2: Icon Tooltips */}
                      <Table.Tr>
                        {/* Detection Column */}
                        <Table.Td>
                          <Group justify="center" gap="xs">
                            <Tooltip label={
                              <div style={{textAlign: 'left', paddingBottom: '0.7rem'}}>
                                <p style={{color: 'black'}}>Factors that INCREASED your detection ability:</p>
                                  {detectionPositiveFeedback.split('\n').map((factor, index) => (
                                <p key={index} style={{margin: 0, paddingLeft: '1em', color: 'black'}}>- {factor}</p>
                                ))}
                              </div>
                            }  color="#8bc17c" position="bottom">
                              <IconTrendingUp size={24} color="#8bc17c" />
                            </Tooltip>
                            <Tooltip label={
                              <div style={{textAlign: 'left', paddingBottom: '0.7rem'}}>
                                <p style={{color: 'black'}}>Factors that DECREASED your detection ability:</p>
                                  {detectionNegativeFeedback.split('\n').map((factor, index) => (
                                <p key={index} style={{margin: 0, paddingLeft: '1em', color: 'black'}}>- {factor}</p>
                                ))}
                              </div>
                            }  color="#f4888a" position="bottom">
                              <IconTrendingDown size={24} color="#f4888a" />
                            </Tooltip>
                          </Group>
                        </Table.Td>

                        {/* Accuracy Column */}
                        <Table.Td>
                          <Group justify="center" gap="xs">
                            <Tooltip label={
                              <div style={{textAlign: 'left', paddingBottom: '0.7rem'}}>
                                <p style={{color: 'black'}}>Factors that INCREASED your accuracy:</p>
                                  {accuracyPositiveFeedback.split('\n').map((factor, index) => (
                                <p key={index} style={{margin: 0, paddingLeft: '1em', color: 'black'}}>- {factor}</p>
                                ))}
                              </div>
                            }  color="#8bc17c" position="bottom">
                              <IconTrendingUp size={24} color="#8bc17c" />
                            </Tooltip>
                            <Tooltip label={
                              <div style={{textAlign: 'left', paddingBottom: '0.7rem'}}>
                                <p style={{color: 'black'}}>Factors that DECREASED your accuracy:</p>
                                  {accuracyNegativeFeedback.split('\n').map((factor, index) => (
                                <p key={index} style={{margin: 0, paddingLeft: '1em', color: 'black'}}>- {factor}</p>
                                ))}
                              </div>
                            }  color="#f4888a" position="bottom">
                              <IconTrendingDown size={24} color="#f4888a" />
                            </Tooltip>
                          </Group>
                        </Table.Td>

                        {/* Damage Column */}
                        <Table.Td>
                          <Group justify="center" gap="xs">
                            <Tooltip label={
                              <div style={{textAlign: 'left', paddingBottom: '0.7rem'}}>
                                <p style={{color: 'black'}}>Factors that INCREASED damage you inflicted:</p>
                                  {damagePositiveFeedback.split('\n').map((factor, index) => (
                                <p key={index} style={{margin: 0, paddingLeft: '1em', color: 'black'}}>- {factor}</p>
                                ))}
                              </div>
                            }  color="#8bc17c" position="bottom">
                              <IconTrendingUp size={24} color="#8bc17c" />
                            </Tooltip>
                            <Tooltip label={
                              <div style={{textAlign: 'left', paddingBottom: '0.7rem'}}>
                                <p style={{color: 'black'}}>Factors that DECREASED damage you inflicted:</p>
                                  {damageNegativeFeedback.split('\n').map((factor, index) => (
                                <p key={index} style={{margin: 0, paddingLeft: '1em', color: 'black'}}>- {factor}</p>
                                ))}
                              </div>
                            }  color="#f4888a" position="bottom">
                              <IconTrendingDown size={24} color="#f4888a" />
                            </Tooltip>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    </Table.Tbody>
                  </Table>
                  <Text style={{fontSize: '0.75rem', color: '#868e96', textAlign: 'center', marginTop: '0.05rem', fontStyle: 'italic'}}>
                      Hover over the icons above for round's feedback.
                  </Text>
                </Card.Section>


                <Card.Section withBorder inheritPadding py="xs">


                  <Text size="xl" fw={700}>Scores</Text>

                  {/* This displays the round summary based on calculations for tactics and overall unit characteristics for the friendly units */}
                  <Grid style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Group style={{ flex: 1, textAlign: 'center' }}>
                      <Grid.Col>
                        <Text size="lg" fw={500}>Attributes</Text>

                        {/* Friendly Attribute Score */}
                        <Tooltip
                          color="gray"
                          position="bottom"
                          transitionProps={{ transition: 'fade-up', duration: 400 }}
                          label="Friendly Attribute Score"
                        >
                          <Progress.Root m={10} style={{ height: '20px' }}>

                            <Progress.Section
                              className={classes.progressSection}
                              value={baseValue}
                              color='#3d85c6'>
                              {baseValue.toFixed(0)}
                            </Progress.Section>

                          </Progress.Root>
                        </Tooltip>

                        {/* Enemy Attribute Score */}
                        <Tooltip
                          color="gray"
                          position="bottom"
                          transitionProps={{ transition: 'fade-up', duration: 400 }}
                          label="Enemy Attribute Score"
                        >
                          <Progress.Root m={10} style={{ height: '20px' }}>

                            <Progress.Section
                              className={classes.progressSection}
                              value={enemyBaseValue}
                              color='#c1432d'>
                              {enemyBaseValue.toFixed(0)}
                            </Progress.Section>

                          </Progress.Root>
                        </Tooltip>
                        {/* 
                          <Text size="lg">Friendly Damage Taken:</Text>
                          <Text> {Number(totalFriendlyDamage).toFixed(0)}</Text> */}
                      </Grid.Col>
                    </Group>


                    {/* This displays the round summary based on calculations for tactics and overall unit characteristics for the enemy units */}
                    <Group style={{ flex: 1, textAlign: 'center' }}>
                      <Grid.Col>
                        <Text size="lg" fw={500}>Tactics</Text>

                        {/* Friendly Tactics Score */}
                        <Tooltip
                          color="gray"
                          position="bottom"
                          transitionProps={{ transition: 'fade-up', duration: 400 }}
                          label="Friendly Tactics Score"
                        >
                          <Progress.Root m={10} style={{ height: '20px' }}>

                            <Progress.Section
                              className={classes.progressSection}
                              value={calculateTacticsScore()}
                              color='#3d85c6'>
                              {calculateTacticsScore()}
                            </Progress.Section>

                          </Progress.Root>
                        </Tooltip>

                        {/* Enemy Tactics Score */}
                        <Tooltip
                          color="gray"
                          position="bottom"
                          transitionProps={{ transition: 'fade-up', duration: 400 }}
                          label="Enemy Tactics Score"
                        >
                          <Progress.Root m={10} style={{ height: '20px' }}>

                            <Progress.Section
                              className={classes.progressSection}
                              value={calculateEnemyTacticsScore()}
                              color='#c1432d'>
                              {calculateEnemyTacticsScore()}
                            </Progress.Section>

                          </Progress.Root>
                        </Tooltip>

                        {/* <Text size="lg">Enemy Damage Taken:</Text>
                          <Text> {totalEnemyDamage.toFixed(0)}</Text> */}
                      </Grid.Col>
                    </Group>
                  </Grid>

                  {/* Displays a progress bar with the total score (overall characteristics and tactics) for the friendly unit */}
                  {/* <div style={{ display: 'flex', justifyContent: 'space-between', padding: '30px' }}>
                      <Progress.Root style={{ width: '200px', height: '25px' }}>
                        <Tooltip
                          position="top"
                          transitionProps={{ transition: 'fade-up', duration: 300 }}
                          label="Overall Score Out of 100"
                        >
                          <Progress.Section
                            className={classes.progressSection}
                            value={Math.round((baseValue * .70) + (Number(TacticsScore) * .30))}
                            color="#4e87c1">
                            {Math.round((baseValue * .70) + (Number(TacticsScore) * .30))}
                          </Progress.Section>
                        </Tooltip>
                      </Progress.Root> */}

                  {/* Displays a progress bar with the total score (overall characteristics and tactics) for the enemy unit */}
                  {/* <Progress.Root style={{ width: '200px', height: '25px' }}>
                        <Tooltip
                          position="top"
                          transitionProps={{ transition: 'fade-up', duration: 300 }}
                          label="Overall Score Out of 100"
                        >
                          <Progress.Section
                            className={classes.progressSection}
                            value={Math.round((enemyBaseValue * .70) + (Number(TacticsScore) * .30))}
                            color="#bd3058">
                            {Math.round((enemyBaseValue * .70) + (Number(TacticsScore) * .30))}
                          </Progress.Section>
                        </Tooltip>
                      </Progress.Root>
                    </div> */}

                </Card.Section>





              </Card>
            </Group>


            {/* Button that either moves the engagement to the next round or ends the engagement based off of friendly and enemy health */}
            <Group justify="center" mt="xl" display={'flex'}>
              <Button display='flex' onClick={() => handleNextRound(Number(friendlyHealth), Number(enemyHealth))}>
                {((Number(friendlyHealth) <= 0) || (Number(enemyHealth) <= 0)) ? 'Exit' : 'Continue Enagement'}
              </Button>
            </Group>
          </div>
        </Stepper.Step>
      </Stepper>
    </MantineProvider>
  );

  // End of the rendering of the battle page
}

export default BattlePage;