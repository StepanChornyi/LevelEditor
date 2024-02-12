import * as CANNON from 'cannon';

export const groundMaterial = new CANNON.Material("groundMaterial");

groundMaterial.friction = 0;

export const ground_ground_cm  = new CANNON.ContactMaterial(groundMaterial, groundMaterial, {
    friction: 0,
    restitution: 0,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
    frictionEquationStiffness: 1e8,
    frictionEquationRegularizationTime: 3,
});
