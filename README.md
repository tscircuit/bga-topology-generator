# bga-topology-generator

This repository is reduced to a single placeholder solver surface for future
integration work.

## Status

`BgaTopologyGenerator` is intentionally not implemented yet.

## Usage

```ts
import { BgaTopologyGenerator } from "bga-topology-generator"
import type { SimpleRouteJson } from "bga-topology-generator"

const input: SimpleRouteJson = {
  layerCount: 2,
  minTraceWidth: 0.15,
  obstacles: [],
  connections: [],
  bounds: { minX: 0, maxX: 10, minY: 0, maxY: 10 },
}

const generator = new BgaTopologyGenerator({ simpleRouteJson: input })

generator.solve()
```
