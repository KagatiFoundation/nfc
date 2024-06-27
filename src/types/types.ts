export enum LitType {
    INT = 'int'
}

export type TSPrimitive = number | boolean;

export class LitVal {
    public value: TSPrimitive;

    public constructor(value: TSPrimitive) {
        this.value = value;
    }
}