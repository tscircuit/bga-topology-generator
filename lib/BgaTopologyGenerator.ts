import type { SimpleRouteJson } from "./types/srj-types"

export interface BgaTopologyGeneratorOptions {
  simpleRouteJson: SimpleRouteJson
}

export class BgaTopologyGenerator {
  constructor(readonly options: BgaTopologyGeneratorOptions) {}

  solve(): never {
    throw new Error("TODO: implement BgaTopologyGenerator.solve()")
  }
}
