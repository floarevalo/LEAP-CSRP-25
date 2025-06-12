// finds distance between two ecef coordinate points in nautical miles
// puts in LEAP context file?
function distnauticalmiles(p1, p2) {
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const dz = p2[2] - p1[2];
    const distmeters = Math.sqrt(dx*dx + dy*dy + dz*dz);
    const distnauticalmi = distmeters/1852; //conversion from meters to nautical miles
    return distnauticalmi;
    
}

function inwez(p1,p2,WEZ){
    const distnm =distnauticalmiles(p1,p2);
    
    const mybool = Boolean (distnm <= WEZ);
    return mybool
}
module.exports = inwez;

// test to see if function works
// const point1 = [1330000.5, -4650000.7, 4120000.2];
// const point2 = [1325000.2, 4651000.1, 4120500.4];
// const WEZ = 10

// const distance = distnauticalmiles(point1,point2)
// console.log(distance)
// const b = inwez(point1,point2,WEZ)
// console.log(b)
