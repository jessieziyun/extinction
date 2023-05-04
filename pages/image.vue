<template>
  <div>
    <div class="grid grid-cols-6 gap-4">
      <div
        v-for="species in data.filteredSummary"
        class="mb-8 show text-xs"
        @click="handleClick"
        :id="species.assessmentId"
      >
        <div class="w-full h-28">
          <img
            class="object-contain h-full w-full"
            :src="species.imageUrl"
            alt=""
          />
        </div>
        <!-- <img class="max-w-xs max-h-xs" :src="species.imageUrl" alt="" /> -->
        <div class="cursor-pointer w-max">{{ species.scientificName }}</div>
        <div class="cursor-pointer w-max">{{ species.kingdomName }}</div>
        <div class="cursor-pointer w-max">{{ species.redlistCategory }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
export default {
  data() {
    return {
      data: {
        summary: null,
        filteredSummary: [],
        assessments: null,
      },
      info: {
        assessment: "",
        position: { x: "0px", y: "0px" },
        show: false,
      },
    };
  },
  methods: {
    async loadData() {
      const filteredData = this.data.summary.filter(
        (species) =>
          species.redlistCategory !== "Least Concern" &&
          species.redlistCategory !== "Data Deficient"
      );
      // use only first x items in array for testing
      this.data.filteredSummary = filteredData.slice(0, 24);
      // search google images and get url of first result
      // for (let i = 0; i < this.data.filteredSummary.length; i++) {
      //   const query = this.data.filteredSummary[i].scientificName.replace(
      //     /\s+/g,
      //     "+"
      //   );
      //   this.data.filteredSummary[i].imageSearch = await useFetch(
      //     `/api/img/${query}`
      //   );
      //   const result = JSON.parse(
      //     JSON.stringify(this.data.filteredSummary[i].imageSearch)
      //   );
      //   this.data.filteredSummary[i].imageUrl = result.data.items[0].link;
      // }
    },
  },
  async mounted() {
    this.data.summary = await d3.csv("/simple_summary.csv");
    this.data.assessments = await d3.csv("/assessments.csv");
    this.loadData();
  },
};
</script>
