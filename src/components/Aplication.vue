<template>
<div class="filters">
  <b-modal id="modal-1" modal-class="my-second-class" title="ROCHE_SFDC" v-bind:hideHeaderClose="true" v-bind:ok-only="true">
    <p class="my-4">Este proceso de carga afecta a las siguientes aplicaciones:</p>
    <ul>
      <li>Hiippo</li>
      <li>ObjetivosCentro</li>
      <li>DeMeInfo</li>
      <li>Listin</li>
      <li>Biomarcadores</li>
    </ul>
  </b-modal>
  <div :data-status="schemaDisabled" class="container">
    <div class="row">
      <div class="col-sm">
        <span>Schemas</span>
        <Multiselect :disabled="schemaDisabled" class="m-md-2 coloring-azul" v-model="schema_values" placeholder="Search or add a schema" :options="schema_options" :multiple="true" :taggable="false">
          <span slot="noResult">Oops! No elements found.</span>
        </Multiselect>
      </div>
      <div class="col-sm">
        <span>Tables</span>
        <Multiselect :disabled="schemaDisabled" class="m-md-2" :selectLabel="table_options.schema" v-model="table_values" track-by="table" placeholder="Search or add a table" label="table" :options="table_options" :multiple="true" :taggable="false">
          <template slot="option" slot-scope="props">
            <div class="option__desc"><span class="option__title">{{ props.option.table }}</span></div>
            <div class="option__desc"><span class="option__schema">{{ props.option.schema }}</span></div>
          </template>
          
          <span slot="noResult">Oops! No elements found.</span>
        </Multiselect>
      </div>
      <div class="col-sm">
        <span>Fields</span>
        <Multiselect  :disabled="schemaDisabled" class="m-md-2" track-by="field" v-model="field_values" placeholder="Search or add a aplication" label="field"  :options="field_options" :multiple="true" :taggable="false">
          <template slot="option" slot-scope="props">
            <div class="option__desc"><span class="option__title">{{ props.option.field }}</span></div>
            <div class="option__desc"><span class="option__schema">{{ props.option.table }}</span></div>
          </template>

          <span slot="noResult">Oops! No elements found.</span>
        </Multiselect>
      </div>
    </div>
  </div>

  <div :data-status="aplicationDisabled" class="container">
    <div class="row">
      <div class="col-sm aplication-filter">
        <span>Projects</span>
        <Multiselect :disabled="aplicationDisabled" class="m-md-2" v-model="aplication_values" placeholder="Search or add a aplication" :options="aplication_options" :multiple="true" :taggable="false">
          <span slot="noResult">Oops! No elements found.</span>
        </Multiselect>
      </div>
    </div>
  </div>

  <!-- Si seleccionamos aplicacion -->
  <div v-if="schemaDisabled && !aplicationDisabled">
    <AplicationSelected :schemas="final_results" :queryAnalizar="queryAnalizar"></AplicationSelected>
  </div>

  <!-- Si seleccionamos esquema -->
  <div v-if="!schemaDisabled && aplicationDisabled">
    <SchemaSelected data-status="" :reloaded="reload" :filteredData="final_results" :TablesBySchemas="table_options" :queryAnalizar="queryAnalizar"></SchemaSelected>
  </div>
 </div>
</template>

<script>
import Multiselect from 'vue-multiselect'
import AplicationSelected from './AplicationSelected.vue'
import SchemaSelected from './SchemaSelected.vue'
import axios from 'axios'

export default {
  name: 'Aplication',
  components: {
    Multiselect,
    AplicationSelected,
    SchemaSelected
  },
  watch: {
    schema_values: function (val, oldVal) {
      if(val.length < oldVal.length){
        this.table_options = this.table_options.filter(function(table){ 
          return table.schema === val[0]
          })
        this.table_values = this.table_values.filter(function(table){ 
          return table.schema === val[0]
          })
        this.field_values= []
      }
      else if(val.length === 0){
        this.field_options = []
        this.table_options = []
      }else {
        this.field_options = []
        this.table_options = []
        val.forEach(schema => this.getTables(schema))
      }
    },
    table_values: function (val) {
      
      this.final_results = []
      this.field_options = []
      val.forEach(table => this.getFields(table))
      
    },
    field_values: function (newVal, oldVal) {
      if(newVal.length === 0){
        this.field_options = []
        this.table_values.forEach(table => this.getFields(table))
      }else{
        this.final_results = []
        this.table_values.forEach(table => this.getSpecificFields(table, newVal))
      }
      this.reload = this.reload + 1
    },
    aplication_values: function(val, oldVal){
      if(val.includes('Roche_SFDC')) this.$bvModal.show('modal-1')
      this.final_results = []
      val.forEach(aplication => this.getTablesByAplication(aplication))
    }
  },

  beforeMount() {

    axios
      .get(this.$main_path + '/api/Schemas')
      .then(response => (this.schema_options = response.data))
    
    axios
      .get(this.$main_path + '/api/applications')
      .then(response => (this.aplication_options = response.data))
  },
  mounted(){
     
  },
  data() {
    return {
      reload: 0,
      final_results: [],
      table_names: [],

      /* Values API */
      conection_options: [],
      schema_values: [],
      table_values:[], 
      field_values:[],
      aplication_values:[],
        
      /* Conections */
      schema_options:[],
      
      /* Tables */
      table_options:[],

      /* Fields */
      field_options: [],
      
      /* Aplications */
      aplication_options: [],
      queryAnalizar: [],
    }
  },
  methods: {
    
    getTables(schema_name){
      axios
      .get(this.$main_path + '/api/Tables', { params: { schema: schema_name } })
      .then(response => {
        let new_data= []
        response.data.forEach(table => new_data.push({schema: schema_name, table: table}))
        if(this.table_options.length === 0) this.table_options = new_data
        else this.table_options = this.table_options.concat(new_data)}
      )
    },
    getTablesByAplication(aplication){
      axios
      .get(this.$main_path + '/api/querysApplication', { params: { application: aplication } })
      .then(response => {
        if(this.final_results.length === 0) response.data.schemas.forEach(schema => this.final_results.push({project: response.data.project, schemas: schema}))
        else response.data.schemas.forEach(schema => this.final_results.push({project: response.data.project, schemas: schema}))}
      )
    },
    getFields(table){
      axios
      .get(this.$main_path + '/api/querys',{ params: { schema: table.schema, table: table.table, field: 0 } })
      .then(response => {
        
        let new_data= []
        new_data.push({schema: table.schema, table: table.table, project: response.data.tables.values[0].project, field: response.data.tables.values})
        
        if(this.field_options.length === 0) this.field_options = new_data[0].field
        else this.field_options = this.field_options.concat(new_data[0].field)

        this.field_options.forEach(field => {
          let j = 0
          for(let i = 0; i<this.field_options.length; i++){
            if(field.field == this.field_options[i].field) {
              j = j + 1
              if(j >= 2){
                this.field_options.splice(i, 1); 
              } 
            }
          }
        })

        this.final_results = this.table_values
        this.final_results.forEach(el => { if(el.schema == table.schema && el.table == table.table) el.fields = response.data.tables.values})
        this.reload = this.reload + 1
      })
    },
    getSpecificFields(table, fields){
      
      fields.forEach(field => 
        axios
        .get(this.$main_path + '/api/querys',{ params: { schema: table.schema, table: table.table, field: field.field } })
        .then(response => {
          
          let new_data
          new_data = {schema: table.schema, table: table.table, project: response.data.tables.values[0].project, fields: response.data.tables.values}
          this.final_results.push(new_data)
          this.reload = this.reload + 1
        })
      )
      this.reload = this.reload + 1
    },
  },
  computed: {
    schemaDisabled: function(){
      if(this.aplication_values === undefined) return false
      else if (this.aplication_values.length === 0) return false
      else return true
    },
    aplicationDisabled: function(){
      if(this.schema_values === undefined) return false
      else if(this.schema_values.length === 0) return false
      else return true
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.col-sm {
  display: flex;
  flex-direction: column;
  height: 120px;
}
.aplication-filter{
  max-width: 413px;
}
.title{
  padding-bottom: 20px;
}
.disabled {
  z-index: 999;
  background-color: rgb(19, 16, 16);
}
.filters{
  margin-left:10%;
  margin-right:10%;
  margin-bottom:10%;
  width: 80%;
  text-align: center;
}
.filters .container{
  padding: 20px;
  border-radius: 10px;
  border-style:solid;
  border-width: 1px !important;
  border-color: black;
  margin-top: 20px;
  margin-bottom: 20px;
}
.option__schema{
  font-size: x-small;
}
.coloring-azul li{
  background: rgb(255, 19, 184) !important;
}
[data-status="true"] {
    cursor: not-allowed;
}
.alert-info{
  padding: 16px;
  text-align: center;
}
.center {
  margin-left: auto;
  margin-right: auto;
}
.alert-info tr {
  background-color: rgb(252, 252, 252);
}
</style>

<style>
#modal-1___BV_modal_backdrop_ {
    background-color: rgb(0,0,0,0.4) !important;
}
ul li {
  list-style-type: circle;
}

</style>