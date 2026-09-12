import React from "react";
import {
  Platform,
  StyleSheet,
  Text as RNText,
  TextInput as RNTextInput,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
} from "react-native";
import { cssInterop } from "nativewind";

/**
 * App-wide Plus Jakarta Sans.
 *
 * React 19 ignores `defaultProps` on function components, so the old
 * `Text.defaultProps.style` trick in the root layout was inert. The fonts are
 * embedded natively instead (see the expo-font plugin in app.json) and applied
 * here.
 *
 * Android gets one real weighted family from the plugin's XML font definitions,
 * so `fontFamily` plus whatever `fontWeight` the caller set resolves correctly.
 * iOS resolves fonts by the family name baked into the file, and Google ships
 * Plus Jakarta Sans with only Regular and Bold under "Plus Jakarta Sans" — the
 * other weights each carry their own family name — so on iOS the weight is
 * mapped to a family by hand.
 *
 * These are registered with `cssInterop` so NativeWind resolves `className`
 * into `style` before we read the weight; that keeps `font-semibold` and
 * friends working.
 */
const FAMILY = "Plus Jakarta Sans";

const IOS_FAMILY_BY_WEIGHT: Record<string, string> = {
  "100": FAMILY,
  "200": FAMILY,
  "300": FAMILY,
  "400": FAMILY,
  normal: FAMILY,
  "500": `${FAMILY} Medium`,
  "600": `${FAMILY} SemiBold`,
  "700": FAMILY, // the Bold face lives in the base family
  bold: FAMILY,
  "800": `${FAMILY} ExtraBold`,
  "900": `${FAMILY} ExtraBold`,
};

function familyStyle(style: StyleProp<TextStyle>): TextStyle {
  if (Platform.OS !== "ios") return { fontFamily: FAMILY };
  const weight = StyleSheet.flatten(style)?.fontWeight;
  return { fontFamily: IOS_FAMILY_BY_WEIGHT[String(weight ?? "400")] ?? FAMILY };
}

function TextBase({ style, ...rest }: TextProps) {
  return <RNText {...rest} style={[familyStyle(style), style]} />;
}

function TextInputBase({ style, ...rest }: TextInputProps) {
  return <RNTextInput {...rest} style={[familyStyle(style), style]} />;
}

export const Text = cssInterop(TextBase, { className: "style" });
export const TextInput = cssInterop(TextInputBase, { className: "style" });
