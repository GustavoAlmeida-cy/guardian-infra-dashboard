# 🛡️ Guardian Infra - Dashboard de Inteligência Climática

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF.svg)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC.svg)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6.svg)](https://www.typescriptlang.org/)

O **Guardian Infra** é uma plataforma de monitoramento em tempo real projetada para a gestão de ativos críticos (subestações, data centers, centros de distribuição) em cenários de risco de inundação. A aplicação utiliza modelos geoespaciais e dados preditivos para oferecer alertas proativos e ações de contingência imediatas.

---

## 📸 Demonstração Visual

<div align="center">
  <img src="./src/assets/images/demos/main-dashboard.png" alt="Dashboard Guardian Infra" width="100%">
  <p><em>[Aguardando imagem: Visão geral do mapa hexagonal em Dark Mode]</em></p>
</div>

<div align="center">
  <img src="./src/assets/images/demos/mobile-view.png" alt="Versão Mobile" width="300px">
  <p><em>[Aguardando imagem: Visualização responsiva no celular]</em></p>
</div>

---

## 🛠️ Tecnologias e Arquitetura

Para este desafio, foi selecionada uma stack de alta performance ("Bleeding Edge") de 2025:

* **Core:** React 19 + Vite (Build ultra-rápido).
* **Visualização Geoespacial:** * **Leaflet:** Base cartográfica robusta.
    * **Deck.gl:** Camada de hexágonos para análise de densidade de risco.
* **Estilização:** Tailwind CSS v4 + **shadcn/ui** (Componentes consistentes e acessíveis).
* **Gerenciamento de Estado:**
    * **Zustand:** Estado global leve para sincronização entre Mapa e Sidebar.
    * **TanStack Query (v5):** Gerenciamento de cache e **Polling de 5 segundos** para simulação de Real-time.
* **Animações:** Framer Motion (Transições de UI e Loading State).
* **Notificações:** Sonner (Toasts otimizados para alertas críticos).

---

## 🧠 Decisões de Engenharia

1.  **Resiliência de Dados (Adapter Pattern):** O sistema foi projetado para consumir diferentes fontes de dados (BH e Nacional). Criamos uma camada de normalização que injeta coordenadas geográficas automaticamente via fallback caso os dados de origem sejam incompletos.
2.  **UX de Missão Crítica:** O dashboard prioriza a visão "Dark Mode" para reduzir a fadiga visual e destacar o sistema de cores de risco (Verde -> Vermelho Neon).
3.  **Polling Adaptativo:** A busca de dados ocorre em segundo plano, garantindo que o operador sempre veja a informação mais recente sem precisar recarregar a página.

---

## 🚀 Como Rodar o Projeto

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/guardian-infra-dashboard.git](https://github.com/seu-usuario/guardian-infra-dashboard.git)
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Inicie o ambiente de desenvolvimento:**
    ```bash
    npm run dev
    ```
4.  **Acesse no navegador:** `http://localhost:5173`

---

## 📌 Status do Requisito (Checklist)

- [x] Visualização em Mapa com Grids Hexagonais
- [x] Listagem de Ativos com Indicadores de Risco
- [x] Sistema de Alerta Proativo (Toasts)
- [x] Detalhes Acionáveis e T.E.I.
- [x] Polling de 5 Segundos (Simulação Real-time)
- [x] Responsividade Mobile-first

---
Desenvolvido como parte do desafio técnico para a Sipremo.
