enum Token {
  Int16 = 1,
  Int32,
  Byte,
  Char,
  String,
  DateTime,
  Double,
  Single,
  Color,
  KnownColor,
  IntEnum,
  EmptyColor,
  Pair = 15,
  Triplet,
  Array = 20,
  StringArray,
  ArrayList,
  Hashtable,
  HybridDictionary,
  Type,
  Nullable, //DEPRECATED
  Unit,
  EmptyUnit,
  EventValidationStore,
// String-table optimized strings
  IndexedStringAdd,
  IndexedString,
// Semi-optimized (TypeConverter-based)
  StringFormatted = 40,
// Semi-optimized (Types)
  TypeRefAdd,
  TypeRefAddLocal,
  TypeRef,
// Un-optimized (Binary serialized) types
  BinarySerialized = 50,
// Optimized for sparse arrays
  SparseArray = 60,
// Constant values
  Null = 100,
  EmptyString,
  ZeroInt32,
  True,
  False
}
