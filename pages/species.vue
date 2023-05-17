<template>
  <div class="text-xs" @click="clickOutside">
    <div
      id="info"
      class="absolute bg-white border border-black w-[400px] flex flex-col justify-between"
      :class="{ visible: info.show, invisible: !info.show }"
    >
      <div class="p-1" v-html="info.assessment"></div>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      <div
        v-for="species in data"
        class="mb-8 show font-serif text-xs cursor-pointer"
        :id="species.assessmentId"
      >
        <div class="w-full h-28">
          <img
            class="object-contain h-full w-full object-left-bottom"
            :src="species.imageUrl"
            :id="species.assessmentId"
            @click.stop="handleClick"
          />
        </div>
        <div class="w-max mt-2">
          {{ species.commonName ? species.commonName : species.scientificName }}
        </div>
        <div class="w-max mb-1">{{ species.redlistCategory }}</div>
        <div class="font-mono w-max text-[10px] leading-3">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
let synth;

export default {
  setup() {
    useHead({
      script: [
        {
          src: "https://unpkg.com/tone",
        },
      ],
    });
  },
  data() {
    return {
      info: {
        assessment: "",
        position: { x: "0px", y: "0px" },
        show: false,
      },
      data: {},
      toHide: "", // ID of previously clicked div
      startTone: false,
      timeout: 5000,
      countdown: true, // remove species every 5 seconds (timeout)
    };
  },
  watch: {
    $route(to, from) {
      console.log("route change to", to);
      console.log("route change from", from);
      this.countdown = false;
    },
  },
  methods: {
    sortData() {
      this.data.sort((a, b) => {
        // const groups = ['kingdomName', 'phylumName', 'className', 'orderName', 'familyName', 'genusName'];
        if (this.compare(a, b, "kingdomName") !== 0) {
          return this.compare(a, b, "kingdomName");
        }
        if (this.compare(a, b, "phylumName") !== 0) {
          return this.compare(a, b, "phylumName");
        }
        if (this.compare(a, b, "className") !== 0) {
          return this.compare(a, b, "className");
        }
        if (this.compare(a, b, "orderName") !== 0) {
          return this.compare(a, b, "orderName");
        }
        if (this.compare(a, b, "familyName") !== 0) {
          return this.compare(a, b, "familyName");
        }
        if (this.compare(a, b, "genusName") !== 0) {
          return this.compare(a, b, "genusName");
        }
        // else
        return 0;
      });
    },
    compare(a, b, property) {
      const propertyA = a[property].toUpperCase(); // ignore upper and lowercase
      const propertyB = b[property].toUpperCase(); // ignore upper and lowercase
      if (propertyA < propertyB) {
        return -1;
      }
      if (propertyA > propertyB) {
        return 1;
      }
      // names must be equal
      return 0;
    },
    hideInfo(){
      // hide previously clicked div
      if (this.toHide !== "") {
        document.getElementById(this.toHide).classList.add("invisible");
        this.toHide = "";
        this.countdown = true;
        this.playTone();
      }
    },
    handleClick(event) {
      // init audio context if not started
      if (!this.startTone) {
        this.initTone();
        this.startTone = true;
      }

      // pause the countdown
      this.clearTimeouts()
      this.countdown = false;

      // display info
      // const divId = event.srcElement.parentElement.id;
      const divId = event.currentTarget.id;
      if (divId) {
        if (divId !== this.toHide) {
          if (this.toHide !== "") {
            document.getElementById(this.toHide).classList.add("invisible");
            this.toHide = "";
            this.countdown = true;
            this.playTone();
          }
          this.info.assessment = this.data.find(
            (elem) => elem.assessmentId == divId
          ).assessment;
          this.info.show = true;
          this.toHide = divId;
          const posX =
            window.innerWidth - event.pageX > 400
              ? event.pageX
              : window.innerWidth - 400;
          this.info.position.x = posX + "px";
          this.info.position.y = event.pageY + "px";
        } else {
          this.clickOutside(event);
        }
      }
    },
    removeRandom() {
      // get a random species and hide it
      // doesn't take into account whether already hidden or not currently
      const randomIndex = Math.floor(
        Math.random() * this.data.length
      );
      const id = this.data[randomIndex].assessmentId;
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
    const { result } = await $fetch("/api/firestore/query?col=species1");

    // very hacky way of updating a link that doesn't work
    // should update firebase. should update the code that assigns the url, actually.
    result.find((elem) => elem.commonName == "Newbery's Rove Beetle").imageUrl =
      "https://inaturalist-open-data.s3.amazonaws.com/photos/24203916/medium.jpeg";
    
    this.data = result;
    this.sortData();
  },
};
</script>

<style>
#info {
  top: v-bind("info.position.y");
  left: v-bind("info.position.x");
}
</style>