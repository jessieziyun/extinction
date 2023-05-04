<template>
  <div>
    <div class="gcse-search"></div>
  </div>
</template>

<script>
import * as d3 from "d3";
export default {
  data() {
    return {
      wikipediaPageId: null,
      url: "http://en.wikipedia.org/",
      data: {
        summary: {},
        filteredSummary: [],
        assessments: {},
      },
    };
  },
  setup() {
    useHead({
      // title: "title",
      script: [
        {
          src: "https://cse.google.com/cse.js?cx=7215ee81aefc14771",
          async: true,
        },
      ],
    });
  },
  // head: {
  //   title: "Another title",
  // },
  methods: {
    
  },
  mounted() {
  },
};
</script>
