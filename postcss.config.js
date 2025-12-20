/**
 * Configuração do PostCSS para processamento de estilos.
 * O uso do '@tailwindcss/postcss' indica a integração com o Tailwind CSS v4,
 * garantindo builds mais rápidos e suporte nativo a recursos modernos do CSS.
 */
export default {
  plugins: {
    // Motor de processamento do Tailwind v4
    "@tailwindcss/postcss": {},

    // Adiciona prefixos de compatibilidade (ex: -webkit, -moz) automaticamente
    autoprefixer: {},
  },
};
