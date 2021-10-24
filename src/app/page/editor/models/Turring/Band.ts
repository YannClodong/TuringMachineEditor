export type SavedBand = {
  init: string[],
  startPosition: "RIGHT"|"LEFT"
}

export const blankCharacter = "ƀ";

export default class Band {
  private band: { [addr: number]: string } = {}
  private pointer: number = 0
  private min: number = 0
  private max: number = 0


  constructor(private initialData: string[], private startPosition: "RIGHT"|"LEFT") {
    this.reset();
  }

  public reset() {
    this.band = {};
    for(let i = 0; i < this.initialData.length; i++) {
      this.band[i] = this.initialData[i];
    }

    if(this.startPosition == "RIGHT") {
      this.pointer = this.initialData.length;
    } else {
      this.pointer = -1;
    }
  }

  public read() {
    return this.readIndex(this.pointer)
  }

  public readWithDelta(d: number) {
    return this.readIndex(this.pointer + d);
  }

  private readIndex(i: number) {
    if(!this.band[i]) return blankCharacter;
    return this.band[i];
  }

  public write(value: string) {
    if(this.pointer > this.max) this.max = this.pointer;
    else if(this.pointer < this.min) this.min = this.pointer;

    this.band[this.pointer] = value;
  }

  public move(direction: "RIGHT"|"LEFT"|"STAT") {
    if(direction == "RIGHT") {
      this.pointer++;
    } else if(direction == "LEFT") {
      this.pointer--;
    }
  }

  public getSavable() {
    return {
      init: this.initialData,
      startPosition: this.startPosition
    } as SavedBand
  }

  public getInitialValueString() {
    if(this.initialData.find(v => v.length != 1)) {
      return this.initialData.join(" | ");
    } else {
      return this.initialData.join("");
    }
  }

  public setInitialValues(i: string) {
    this.initialData = getValue(i);
  }
}

const getValue = (str: string) => {
  if(str.includes("|")) {
    return str.split("|").map(v => v.trim()).filter(v => v != "");
  } else {
    const res = []
    for(let i = 0; i < str.length; i++) {
      res.push(str.slice(i, i + 1));
    }
    return res;
  }
}