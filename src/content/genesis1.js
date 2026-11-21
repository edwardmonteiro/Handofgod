// Verse cards for the Genesis 1 vertical slice. Brain lane (content).
// English: World English Bible (WEB), public domain. Portuguese: original rendering by the project team.
// Sources and licences: docs/design/text-sources.md.

export const TITLE = {
  kicker: 'Hand of God',
  lines: ['A Mão de Deus'],
  big: true,
  sub: ['Genesis · Gênesis 1'],
  hint: 'press, hold, release · clique, segure, solte',
};

export const CARDS = {
  traverse: {
    kicker: 'Genesis 1:2',
    lines: ['Darkness was on the surface of the deep,', 'and God’s Spirit was hovering over the surface of the waters.'],
    sub: ['Havia trevas sobre a face do abismo, e o Espírito de Deus pairava sobre as águas.'],
    hint: '← → walk · space jump · push the stone · hold sides to walk, tap middle to jump',
  },
  light: {
    kicker: 'Genesis 1:3',
    lines: ['God said, “Let there be light,”', 'and there was light.'],
    sub: ['Deus disse: “Que haja luz” — e a luz passou a existir.'],
    hint: 'hold to gather the light · segure para reunir a luz',
  },
  firmament: {
    kicker: 'Genesis 1:6',
    lines: ['“Let there be an expanse in the middle of the waters,', 'and let it divide the waters from the waters.”'],
    sub: ['“Haja uma expansão no meio das águas, separando águas de águas.”'],
    hint: 'drag up to lift · press down to part · arraste para cima, pressione para separar',
  },
  land: {
    kicker: 'Genesis 1:9',
    lines: ['“Let the waters under the sky be gathered together to one place,', 'and let the dry land appear.”'],
    sub: ['“Que as águas se reúnam num só lugar, e apareça a terra seca.”'],
    hint: 'gather the waters · reúna as águas',
  },
};

export const END = {
  kicker: 'Genesis 1:10',
  lines: ['God saw that it was good.'],
  sub: ['E Deus viu que era bom.'],
  hint: 'the chapter continues · o capítulo continua',
};

export const MISSING = (id) => ({
  kicker: 'In progress · Em construção',
  lines: [`The ${id} stage is still being built by the team.`],
  sub: ['Esta etapa ainda está sendo construída.'],
});
