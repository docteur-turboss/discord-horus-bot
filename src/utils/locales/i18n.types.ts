import en from "../../locales/en";
// import fr from "../../locales/fr.json";

export type Translations = typeof en;
// export type Translations = typeof en & typeof fr;
export type TranslationKey = keyof Translations;

export type ExtractVars<S extends string> =
  S extends `${string}{${infer Var}}${infer Rest}`
    ? Var | ExtractVars<Rest>
    : never;

type TranslationVars = {
  [K in TranslationKey]: ExtractVars<Translations[K]> extends never
    ? undefined
    : Record<ExtractVars<Translations[K]>, string>;
};

export type VarsFor<K extends TranslationKey> = TranslationVars[K];