export const findClosestPoint = (arg1, arg2) => {
    const toRadians = (degrees) => degrees * (Math.PI / 180);

    const haversineDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in kilometers
    };

    let closestPoint = null;
    let minDistance = Infinity;

    arg2.forEach(point => {
        const distance = haversineDistance(arg1.latitude, arg1.longitude, point.lat, point.lng);
        if (distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
        }
    });

    return closestPoint;
}