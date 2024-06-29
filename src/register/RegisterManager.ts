export enum RegisterState {
    ALLOCED,
    FREE
}

export interface Register {
    name: string;
    state: RegisterState;
}

export default class RegisterManager {
    private regList: Register[] = [];

    public constructor(regs?: Register[]) {
        if (regs) {
            this.regList = regs;
        }
    }

    public name(idx: number): string {
        if (idx < 0 || idx > this.regList.length) {
            throw new Error("Invalid register index given.");
        }
        return this.regList[idx].name;
    }

    public allocate(): number {
        for (let i = 0; i < this.regList.length; i++) {
            const reg = this.regList[i];
            if (reg.state === RegisterState.FREE) {
                reg.state = RegisterState.ALLOCED;
                return i;
            }
        }
        throw new Error("Register exhausation.");
    }

    public deallocate(idx: number) {
        if (idx < 0 || idx > this.regList.length) {
            throw new Error("Invalid register index given to free.");
        }
        this.regList[idx].state = RegisterState.FREE;
    }
}