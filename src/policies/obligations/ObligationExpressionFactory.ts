import {ObligationExpression} from './ObligationExpression'
export class ObligationExpressionFactory {
  /**
   * A plain object obligation has the format...
   * {
   *  "obligation-name": {
   *    "key": "value",
   *    ...
   *    "fulfillOn": "<Allow|Deny>"
   *  }
   * }
   * @param {object} plainObjectObligations
   * @returns {Array<ObligationExpression>} An array containing obligation expressions
   */
  create(plainObjectObligations): Array<ObligationExpression> {
    if (!plainObjectObligations) return [];
    let obligations = [];
    for (let i = 0; i < plainObjectObligations.length; i++) {
      let obligation = plainObjectObligations[i];
      obligations.push(new ObligationExpression(obligation.id, obligation.fulfillOn, obligation.expression));
    }
    return obligations;
  }
}
