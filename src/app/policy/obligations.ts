export class ObligationExpression {
  private _id;
  private _fulfillOn;
  private _attributes;
  private _expression;
  constructor(id, fullfillOn, expression) {
    this._id = id;
    this._fulfillOn = fullfillOn;
    this._expression = expression;
    this._attributes = [];
    this._expression.forEach(assignmentExpression => {
      if (assignmentExpression.attribute) {
        const attribute = assignmentExpression.attribute;
        if (!this._attributes.includes(attribute)) {
          this._attributes.push(attribute);
        }
      }
    });
  }
  get id() {
    return this._id;
  }
  get fulfillOn() {
    return this._fulfillOn;
  }
  get expression() {
    return this._expression;
  }
  get attributes(): string[] {
    return this._attributes;
  }
}
