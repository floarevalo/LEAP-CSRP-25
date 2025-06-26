 export const airAssaultBLUE = '/public/images/symbols/air_assault_BLUE.png';
 export const airAssaultRED = '/images/symbols/air_assault_RED.png';

 export const airDefenseBLUE = '/public/images/symbols/air_defense_BLUE.png';
 export const airDefenseRED = '/public/images/symbols/air_defense_RED.png';

 export const ammunitionBLUE = '/public/images/symbols/ammunition_BLUE.png';
 export const ammunitionRED = '/public/images/symbols/ammunition_RED.png';

 export const armoredBLUE = '/public/images/symbols/armored_mechanized_BLUE.png';
 export const armoredRED = '/public/images/symbols/armored_mehanized_RED.png';

 export const armoredTrackedBLUE = '/public/images/symbols/armored_mechanized_tracked_BLUE.png';
 export const armoredTrackedRED = '/public/images/symbols/armored_mechanized_tracked_RED.png';

 export const combatServiceBLUE = '/public/images/symbols/combat_service_support_BLUE.png';
 export const combatServiceRED = '/public/images/symbols/combat_service_support_RED.png';

 export const combatSupportBLUE = '/public/images/symbols/combat_support_BLUE.png';
 export const combatSupportRED = '/public/images/symbols/combat_support_RED.png';

 export const combinedArmsBLUE = '/public/images/symbols/combined_arms_BLUE.png';
 export const combinedArmsRED = '/public/images/symbols/combined_arms_RED.png';

 export const commandControlBLUE = '/public/images/symbols/command_and_control_BLUE.png';
 export const commandControlRED = '/public/images/symbols/command_and_control_RED.png';

 export const electronicWarfareBLUE = '/public/images/symbols/electronic_warfare_BLUE.png';
 export const electronicWarfareRED = '/public/images/symbols/electronic_warfare_RED.png';

 export const engineerBLUE = '/public/images/symbols/engineer_BLUE.png';
 export const engineerRED = '/public/images/symbols/engineer_RED.png';

 export const fieldArtilleryBLUE = '/public/images/symbols/field_artillery_BLUE.png';
 export const fieldArtilleryRED = '/public/images/symbols/field_artillery_RED.png';

 export const infantryBLUE = '/public/images/symbols/infantry_BLUE.png';
 export const infantryRED = '/public/images/symbols/infantry_RED.png';

 export const medicalBLUE = '/public/images/symbols/medical_treatment_facility_BLUE.png';
 export const medicalRED = '/public/images/symbols/medical_treatment_facility_RED.png';

 export const petroleumBLUE = '/public/images/symbols/petroleum_oil_lubricants_BLUE.png';
 export const petroleumRED = '/public/images/symbols/petroleum_oil_lubricants_RED.png';

 export const railheadBLUE = '/public/images/symbols/railhead_BLUE.png';
 export const railheadRED = '/public/images/symbols/railhead_RED.png';

 export const reconBLUE = '/public/images/symbols/recon_BLUE.png';
 export const reconRED = '/public/images/symbols/recon_RED.png';

 export const rotaryBLUE = '/public/images/symbols/rotary_wing_BLUE.png';
 export const rotaryRED = '/public/images/symbols/rotary_wing_RED.png';

 export const seaPortBLUE = '/public/images/symbols/sea_port_BLUE.png';
 export const seaPortRED = '/public/images/symbols/sea_port_RED.png';

 export const selfPropelledBLUE = '/public/images/symbols/self_propelled_BLUE.png';
 export const selfPropelledRED = '/public/images/symbols/self_propelled_RED.png';

 export const signalBLUE = '/public/images/symbols/signal_BLUE.png';
 export const signalRED = '/public/images/symbols/signal_RED.png';

 export const specialOperationsBLUE = '/public/images/symbols/special_operations_forces_BLUE.png';
 export const specialOperationsRED = '/public/images/symbols/special_operations_forces_RED.png';

 export const sustainmentBLUE = '/public/images/symbols/sustainment_BLUE.png';
 export const sustainmentRED = '/public/images/symbols/sustainment_RED.png';

 export const unmannedBLUE = '/public/images/symbols/unmanned_aerial_systems_BLUE.png';
 export const unmannedRED = '/public/images/symbols/unmanned_aerial_systems_RED.png';

interface UnitImage {
    blue: string;
    red: string;
}
// must edit in imageLoader as well
function unitTypeToKey(unitType: string): keyof typeof unitImages | undefined {
    switch (unitType) {
        case 'Command and Control':
            return 'commandAndControl';
        case 'Infantry':
            return 'infantry';
        case 'Reconnaissance':
            return 'recon';
        case 'Armored Mechanized':
            return 'armoredMechanized';
        case 'Combined Arms':
            return 'combinedArms';
        case 'Armored Mechanized Tracked':
            return 'armoredMechanizedTracked';
        case 'Field Artillery':
            return 'fieldArtillery';
        case 'Self-propelled':
            return 'selfPropelled';
        case 'Electronic Warfare':
            return 'electronicWarfare';
        case 'Signal':
            return 'signal';
        case 'Special Operations Forces':
            return 'specialOperationsForces';
        case 'Ammunition':
            return 'ammunition';
        case 'Air Defense':
            return 'airDefense';
        case 'Engineer':
            return 'engineer';
        case 'Air Assault':
            return 'airAssault';
        case 'Medical Treatment Facility':
            return 'medicalTreatmentFacility';
        case 'Aviation Rotary Wing':
            return 'rotaryWing';
        case 'Combat Support':
            return 'combatSupport';
        case 'Sustainment':
            return 'sustainment';
        case 'Unmanned Aerial Systems':
            return 'unmannedAerialSystems';
        case 'Combat Service Support':
            return 'combatServiceSupport';
        case 'Petroleum, Oil and Lubricants':
            return 'petroleumOilLubricants';
        case 'Sea Port':
            return 'seaPort';
        case 'Railhead':
            return 'railhead';
        case 'Special Operations Forces - EZO':
            return 'specialOperationsForces';
        case 'Armor Company':
            return 'armoredMechanizedTracked';
        default:
            return undefined; // Handle cases where unitType does not match any key
    }
}

const unitImages: { [key: string]: UnitImage } = {
    airAssault: { blue: airAssaultBLUE, red: airAssaultRED },
    airDefense: { blue: airDefenseBLUE, red: airDefenseRED },
    ammunition: { blue: ammunitionBLUE, red: ammunitionRED },
    armoredMechanized: { blue: armoredBLUE, red: armoredRED },
    armoredMechanizedTracked: { blue: armoredTrackedBLUE, red: armoredTrackedRED },
    combatServiceSupport: { blue: combatServiceBLUE, red: combatServiceRED },
    combatSupport: { blue: combatSupportBLUE, red: combatSupportRED },
    combinedArms: { blue: combinedArmsBLUE, red: combinedArmsRED },
    commandAndControl: { blue: commandControlBLUE, red: commandControlRED },
    electronicWarfare: { blue: electronicWarfareBLUE, red: electronicWarfareRED },
    engineer: { blue: engineerBLUE, red: engineerRED },
    fieldArtillery: { blue: fieldArtilleryBLUE, red: fieldArtilleryRED },
    infantry: { blue: infantryBLUE, red: infantryRED },
    medicalTreatmentFacility: { blue: medicalBLUE, red: medicalRED },
    petroleumOilLubricants: { blue: petroleumBLUE, red: petroleumRED },
    railhead: { blue: railheadBLUE, red: railheadRED },
    recon: { blue: reconBLUE, red: reconRED },
    rotaryWing: { blue: rotaryBLUE, red: rotaryRED },
    seaPort: { blue: seaPortBLUE, red: seaPortRED },
    selfPropelled: { blue: selfPropelledBLUE, red: selfPropelledRED },
    signal: { blue: signalBLUE, red: signalRED },
    specialOperationsForces: { blue: specialOperationsBLUE, red: specialOperationsRED },
    sustainment: { blue: sustainmentBLUE, red: sustainmentRED },
    unmannedAerialSystems: { blue: unmannedBLUE, red: unmannedRED },
};

interface Props {
    unitType: keyof typeof unitImages;
    isFriendly: boolean;
}

 export const getImageSRC = (unitType: string, isFriendly: boolean): string => {
    const unitKey = unitTypeToKey(unitType);

    // Check if the unitKey is valid
    if (!unitKey) {
        console.warn(`No matching unit key found for unit type: ${unitType}`);
        return ''; // Handle the case where the unit type does not match
    }

    // Determine the image source based on the isFriendly flag
    const imageSrc = isFriendly ? unitImages[unitKey].blue : unitImages[unitKey].red;

    return imageSrc; // Return the image source (blue or red)
};


 export  default getImageSRC;