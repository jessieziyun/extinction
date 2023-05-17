<template>
  <div class="text-xs" @click="clickOutside">
    <!-- <div class="font-mono mb-4">Total: {{ data.filteredSummary.length }}</div> -->
    <div
      id="info"
      class="absolute bg-white border border-black w-[400px] flex flex-col justify-between"
      :class="{ visible: info.show, invisible: !info.show }"
    >
      <div class="p-1" v-html="info.assessment"></div>
    </div>
    <div
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    >
      <div
        v-for="species in data.filteredSummary"
        class="mb-8 show"
        @click.stop="handleClick"
        :id="species.assessmentId"
      >
        <div class="cursor-pointer w-max">{{ species.scientificName }}</div>
        <div class="cursor-pointer w-max">{{ species.kingdomName }}</div>
        <div class="cursor-pointer w-max">{{ species.redlistCategory }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
import { onBeforeRouteUpdate } from "vue-router";

let synth;

export default {
  data() {
    return {
      data: {
        summary: {},
        filteredSummary: [],
        assessments: {},
      },
      info: {
        assessment: "",
        position: { x: "0px", y: "0px" },
        show: false,
      },
      toHide: "", // ID of previously clicked div
      keys: {}, // for testing
      startTone: false,
      timeout: 5000,
      countdown: true, // remove species every 5 seconds (timeout)
    };
  },
  setup() {
    useHead({
      // title: "title",
      script: [
        {
          src: "https://unpkg.com/tone",
        },
      ],
    });
  },
  watch: {
    $route(to, from) {
      console.log("route change to", to);
      console.log("route change from", from);
      this.countdown = false;
    },
  },
  methods: {
    filterData() {
      const filteredData = this.data.summary.filter(
        (species) =>
          species.redlistCategory !== "Least Concern" &&
          species.redlistCategory !== "Data Deficient"
      );
      this.data.filteredSummary = filteredData;
      this.keys = Object.keys(filteredData[0]);
    },
    handleClick(event) {
      // init audio context if not started
      if (!this.startTone) {
        this.initTone();
        this.startTone = true;
      }

      // hide previously clicked div
      if (this.toHide !== "") {
        document.getElementById(this.toHide).classList.add("invisible");
        this.toHide = "";
        this.countdown = true;
        this.playTone();
      }

      // pause the countdown
      this.clearTimeouts()
      this.countdown = false;

      // display info
      // const divId = event.srcElement.parentElement.id;
      const divId = event.currentTarget.id;
      if (divId) {
        if (divId !== this.toHide) {
          this.info.assessment = this.data.assessments.find(
            (elem) => elem.assessmentId == divId
          ).rationale;
          this.info.show = true;
          this.toHide = divId;
          const posX =
            window.innerWidth - event.pageX > 400
              ? event.pageX
              : window.innerWidth - 400;
          this.info.position.x = posX + "px";
          this.info.position.y = event.pageY + "px";
        } else {
          this.clickOutside();
        }
      }
    },
    removeRandom() {
      // get a random species and hide it
      // doesn't take into account whether already hidden or not currently
      const randomIndex = Math.floor(
        Math.random() * this.data.filteredSummary.length
      );
      const id = this.data.filteredSummary[randomIndex].assessmentId;
      const elem = document.getElementById(id);
      if (elem) document.getElementById(id).classList.add("invisible");
      this.playTone();

      // if the countdown is ongoing (ie the info div isn't visible)
      if (this.countdown) {
        setTimeout(() => {
          this.removeRandom();
        }, this.timeout);
      }
    },
    async initTone() {
      await Tone.start();
      synth = new Tone.Synth().toDestination();
    },
    playTone() {
      if (this.startTone && this.countdown) {
        synth.triggerAttackRelease("C4", "8n");
      }
    },
    clickOutside(event) {
      // init audio context if not started
      if (!this.startTone) {
        this.initTone();
        this.startTone = true;
      }
      // ignore click on info box
      if (
        event.srcElement.parentElement.id == "info" ||
        event.srcElement.id == "info"
      ) {
        return;
      }
      if (this.toHide !== "") {
        this.info.assessment = "";
        this.info.show = false;
        document.getElementById(this.toHide).classList.add("invisible");
        this.toHide = "";
        this.countdown = true;
        this.playTone();
        setTimeout(() => {
          this.removeRandom();
        }, this.timeout);
      }
    },
    clearTimeouts(){
      let id = window.setTimeout(function () {}, 0);
      while (id--) {
        window.clearTimeout(id); // will do nothing if no timeout with id is present
      }
    }
  },
  async mounted() {
    this.data.summary = await d3.csv("/simple_summary.csv");
    this.data.assessments = await d3.csv("/assessments.csv");
    this.filterData();
    setTimeout(() => {
      this.removeRandom();
    }, this.timeout);
  },
};
</script>

<style scoped>
#info {
  top: v-bind("info.position.y");
  left: v-bind("info.position.x");
}
</style>
