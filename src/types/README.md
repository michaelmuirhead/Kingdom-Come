# /src/types — Pure Type Definitions

`interface` and `type` declarations only. No values, no runtime code, no imports outside `/src/types`. These types are the contract between the data layer, the store layer, and the engine.

Zod schemas in `/src/data/schemas` mirror these types for runtime validation of authored content at load time.
