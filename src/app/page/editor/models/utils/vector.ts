export default class Vector {
  constructor(public x: number, public y: number) {
  }

  add(v2: Vector) {
    return new Vector(this.x + v2.x, this.y + v2.y);
  }

  sub(v2: Vector) {
    return new Vector(this.x - v2.x, this.y - v2.y)
  }

  scalar(s: number) {
    return new Vector(s * this.x, s * this.y)
  }

  length() {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2))
  }

  normalize() {
    return this.scalar(1 / this.length());
  }

  perpendicular() {
    return new Vector(-this.y, this.x)
  }
}
