/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import fs from 'fs';
import {join} from 'path';

import {CldrData} from '../cldr-data';
import {generateBaseCurrencies} from '../locale-base-currencies';
import {generateLocaleExtra} from '../locale-extra-file';
import {generateLocale} from '../locale-file';
import {generateLocaleGlobalFile} from '../locale-global-file';

import {BASE_LOCALE} from './base-locale';

/**
 * Generates locale files for each available CLDR locale and writes it to the
 * specified directory.
 */
async function main() {
  const cldrData = new CldrData();
  const baseLocaleData = cldrData.getLocaleData(BASE_LOCALE)!;
  const baseCurrencies = generateBaseCurrencies(baseLocaleData);

  // Generate locale files for all locales we have data for.
  await Promise.all(
    cldrData.availableLocales.flatMap(async (localeData) => {
      const locale = localeData.locale;
      const localeFile = generateLocale(locale, localeData, baseCurrencies);
      const localeExtraFile = generateLocaleExtra(locale, localeData);
      const localeGlobalFile = generateLocaleGlobalFile(locale, localeData, baseCurrencies);

      return [
        fs.promises.writeFile(`${locale}.ts`, localeFile),
        fs.promises.writeFile(join('extra', `${locale}.ts`), localeExtraFile),
        fs.promises.writeFile(join('global', `${locale}.js`), localeGlobalFile),
      ];
    }),
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
