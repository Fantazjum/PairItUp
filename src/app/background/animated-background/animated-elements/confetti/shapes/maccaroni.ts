const weight = 2;

const v0 = [-0.25, 0.172, 0,];
const v1 = [-0.175, 0.17, 0,];
const v2 = [-0.1, 0.16, 0,];
const v3 = [-0.025, 0.155, 0,];
const v4 = [0.05, 0.175, 0,];
const v5 = [0.075, 0.185, 0,];
const v6 = [0.15, 0.2, 0,];
const v7 = [0.21, 0.175, 0,];
const v8 = [0.15, 0.05, 0,];
const v9 = [0.23, 0.075, 0,];
const v10 = [0.225, -0.05, 0,];
const v11 = [0.19, -0.15, 0,];
const v12 = [0.125, -0.2, 0,];
const v13 = [0.05, -0.225, 0,];
const v14 = [-0.075, -0.25, 0,];
const v15 = [-0.15, -0.24, 0,];
const v16 = [-0.125, 0, 0,];
const v17 = [-0.19, -0.035, 0,];
const v18 = [-0.225, -0.21, 0,];
const v19 = [-0.2, 0.025, 0,];
const v20 = [-0.23, 0.1, 0,];

const faces = [ 
    ...v0, ...v20, ...v1,
    ...v1, ...v20, ...v19,
    ...v1, ...v19, ...v16,
    ...v1, ...v16, ...v2,
    ...v2, ...v16, ...v14,
    ...v2, ...v14, ...v3,
    ...v3, ...v13, ...v4,
    ...v4, ...v12, ...v5,
    ...v5, ...v11, ...v8,
    ...v5, ...v7, ...v6,
    ...v5, ...v8, ...v7,
    ...v7, ...v8, ...v9,
    ...v10, ...v9, ...v8,
    ...v11, ...v10, ...v8,
    ...v11, ...v5, ...v12,
    ...v12, ...v4, ...v13,
    ...v13, ...v3, ...v14,
    ...v16, ...v15, ...v14,
    ...v15, ...v16, ...v17,
    ...v17, ...v16, ...v19,
    ...v15, ...v17, ...v18,
];

export {
    faces,
    weight,
};