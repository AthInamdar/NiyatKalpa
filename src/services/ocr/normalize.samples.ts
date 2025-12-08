import { parseAndNormalize } from './normalize';

const samples = [
  "B.No.: D56G   MFG: 08/25   EXP: 07/27   MRP ₹30.00 Incl. of all taxes",
  "Batch: X27C | Mfd: 07/25 | Exp: 06/27 | MRP Rs. 25.00",
  "BNO D56G MFG 08/25 EXP 07/27 MRP 30.00",
  "Batch No.: L45F\nMfg. Date: 06/25\nExp. Date: 05/27\nM.R.P. ₹45.00 (Incl. taxes)",
  "MFG 07.25 EXP 06.27 B.No. X78A MRP ₹20.00",
  "Use Before 09/27  MFD 08/25  Batch L24  MRP ₹55 incl. of all taxes",
];

export const runSampleNormalization = () => {
  return samples.map((text) => ({
    text,
    normalized: parseAndNormalize(text),
  }));
};
