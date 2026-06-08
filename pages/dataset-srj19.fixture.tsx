import { GenericSolverDebugger } from "@tscircuit/solver-utils/react"
import { useEffect, useMemo, useState } from "react"
import { BgaTopologyGenerator } from "../lib/BgaTopologyGenerator"
import type { SimpleRouteJson } from "../lib/types/srj-types"

type DatasetEntry = {
  id: string
  srj: SimpleRouteJson
}

const isSimpleRouteJson = (value: unknown): value is SimpleRouteJson => {
  if (!value || typeof value !== "object") return false

  const candidate = value as Partial<SimpleRouteJson>
  return (
    typeof candidate.layerCount === "number" &&
    typeof candidate.minTraceWidth === "number" &&
    Array.isArray(candidate.obstacles) &&
    Array.isArray(candidate.connections) &&
    Boolean(candidate.bounds)
  )
}

const samplePathPattern = /\/sample(\d{3})\.circuit\.simple-route\.json$/

const srjModules = import.meta.glob(
  "../node_modules/@tsci/tscircuit.dataset-srj19-bga-passive-overlays/circuits/sample*/sample*.circuit.simple-route.json",
  {
    eager: true,
    import: "default",
  },
) as Record<string, unknown>

const circuits = Object.entries(srjModules)
  .map(([path, srj]): DatasetEntry | null => {
    const match = path.match(samplePathPattern)
    if (!match || !isSimpleRouteJson(srj)) return null

    return {
      id: match[1],
      srj,
    }
  })
  .filter((entry): entry is DatasetEntry => entry !== null)
  .sort((a, b) => Number(a.id) - Number(b.id))

const normalizeSampleId = (value: string) => {
  const digits = value.replace(/[^0-9]/g, "")
  if (digits.length === 0) return null
  return digits.padStart(3, "0").slice(-3)
}

export default function DatasetSrj19Fixture() {
  const [inputValue, setInputValue] = useState("")
  const [currentId, setCurrentId] = useState("")
  const [error, setError] = useState("")

  const circuitMap = useMemo(
    () => new Map(circuits.map((circuit) => [circuit.id, circuit])),
    [],
  )

  useEffect(() => {
    if (circuits.length === 0) {
      setError("No dataset samples were found. Install dependencies first.")
      return
    }

    const params = new URLSearchParams(window.location.search)
    const requested = normalizeSampleId(params.get("sample") ?? "")
    const initialId =
      requested && circuitMap.has(requested) ? requested : circuits[0].id

    setCurrentId(initialId)
    setInputValue(String(Number(initialId)))

    if (requested && !circuitMap.has(requested)) {
      setError(`Sample ${requested} was not found.`)
    }
  }, [circuitMap])

  useEffect(() => {
    if (!currentId) return

    const params = new URLSearchParams(window.location.search)
    params.set("sample", currentId)
    const search = params.toString()
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${search ? `?${search}` : ""}`,
    )
  }, [currentId])

  const currentCircuit = currentId ? (circuitMap.get(currentId) ?? null) : null

  const selectSample = (value: string) => {
    setInputValue(value)

    const normalized = normalizeSampleId(value)
    if (!normalized) {
      setError("Enter a sample number.")
      return
    }

    if (!circuitMap.has(normalized)) {
      setError(`Sample ${normalized} was not found.`)
      return
    }

    setCurrentId(normalized)
    setInputValue(String(Number(normalized)))
    setError("")
  }

  return (
    <div>
      <label>
        Sample{" "}
        <input
          type="number"
          min={1}
          max={999}
          value={inputValue}
          onChange={(event) => selectSample(event.currentTarget.value)}
        />
      </label>

      {currentCircuit ? (
        <>
          <div>
            sample{currentCircuit.id} | layers: {currentCircuit.srj.layerCount}{" "}
            | obstacles: {currentCircuit.srj.obstacles.length} | connections:{" "}
            {currentCircuit.srj.connections.length}
          </div>
          <GenericSolverDebugger
            key={currentCircuit.id}
            createSolver={() =>
              new BgaTopologyGenerator({
                simpleRouteJson: currentCircuit.srj,
              })
            }
          />
        </>
      ) : (
        <div>No sample selected.</div>
      )}

      {error ? <div>{error}</div> : null}
    </div>
  )
}
