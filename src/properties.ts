import {
  compatNames,
  compatSyntax,
  getCompat,
  getPropertyData,
  getTypesData,
  isAddedBySome,
  isDeprecated,
} from './compat';
import { getProperties, getPropertySyntax } from './data';
import { createPropertyDataTypeResolver, resolveDataTypes } from './data-types';
import { properties as rawSvgProperties } from './data/svg';
import { warn } from './logger';
import parse from './parser';
import typing, { ResolvedType } from './typer';

const ALL = 'all';

const IGNORES = [
  // Custom properties
  '--*',
  // We define this manually
  ALL,
];

const REGEX_VENDOR_PROPERTY = /^-/;

interface IProperty {
  name: string;
  vendor: boolean;
  shorthand: boolean;
  obsolete: boolean;
  types: ResolvedType[];
}

const globalCompatibilityData = getTypesData('global_keywords');
if (!globalCompatibilityData) {
  throw new Error('Compatibility data for CSS-wide keywords is missing or may have been moved');
}

// The CSS-wide keywords are identical to the `all` property
// https://www.w3.org/TR/2016/CR-css-cascade-4-20160114/#all-shorthand
export const globals: ResolvedType[] = resolveDataTypes(
  typing(compatSyntax(globalCompatibilityData, parse(getPropertySyntax(ALL)))),
);

export const htmlProperties: { [name: string]: IProperty } = {
  // Empty so that it only receives CSS-wide keywords
  all: {
    name: 'all',
    vendor: false,
    shorthand: true,
    obsolete: false,
    types: [],
  },
};
export const svgProperties: { [name: string]: IProperty } = {};

const propertiesData = getProperties();

for (const originalName in propertiesData) {
  if (IGNORES.includes(originalName)) {
    continue;
  }

  // Default values
  let entities = parse(getPropertySyntax(originalName));
  let currentNames: string[] = [originalName];
  let obsoleteNames: string[] = [];
  let deprecated = isDeprecated(propertiesData[originalName]);

  const compatibilityData = getPropertyData(originalName);

  if (compatibilityData) {
    const compat = getCompat(compatibilityData);

    if (!isAddedBySome(compat)) {
      // The property needs to be added by some browsers
      continue;
    }

    entities = compatSyntax(compatibilityData, entities);
    currentNames = currentNames.concat(filterMissingProperties(compatNames(compat, originalName)));
    obsoleteNames = obsoleteNames.concat(filterMissingProperties(compatNames(compat, originalName, true)));
    deprecated = isDeprecated(propertiesData[originalName], compat);
  }

  if (deprecated) {
    // Move all property names to obsolete
    obsoleteNames = obsoleteNames.concat(currentNames);
    currentNames = [];
  }

  const types = resolveDataTypes(typing(entities), createPropertyDataTypeResolver(compatibilityData));

  // Remove duplicates
  for (const name of new Set(currentNames)) {
    htmlProperties[name] = mergeRecurrent(name, {
      name: originalName,
      vendor: isVendorProperty(name),
      shorthand: propertiesData[originalName].shorthand,
      obsolete: false,
      types,
    });
  }

  // Remove duplicates
  for (const name of new Set(obsoleteNames)) {
    htmlProperties[name] = mergeRecurrent(name, {
      name: originalName,
      vendor: isVendorProperty(name),
      shorthand: propertiesData[originalName].shorthand,
      obsolete: true,
      types,
    });
  }
}

for (const name in rawSvgProperties) {
  const compatibilityData = getPropertyData(name);
  const syntax = rawSvgProperties[name].syntax;
  if (syntax) {
    svgProperties[name] = {
      name,
      vendor: false,
      shorthand: false,
      obsolete: false,
      types: resolveDataTypes(typing(parse(syntax)), createPropertyDataTypeResolver(compatibilityData)),
    };
  }
}

export function isVendorProperty(name: string) {
  return REGEX_VENDOR_PROPERTY.test(name);
}

function filterMissingProperties(names: string[]) {
  // Filter only those which isn't defined in MDN data
  return names.filter(name => !(name in propertiesData));
}

function mergeRecurrent(name: string, property: IProperty) {
  if (name in htmlProperties) {
    const current = htmlProperties[name];

    if (current.name !== property.name) {
      warn('Property `%s` resolved by `%s` was duplicated by `%s`', name, property.name, current.name);
    }

    return {
      ...current,
      // Only mark as obsolete if it's mutual
      obsolete: current.obsolete && property.obsolete,
    };
  }

  return property;
}
