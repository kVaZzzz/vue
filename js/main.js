let eventBus = new Vue()

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true,
        }
    },
    template: `
   <div class="product">
    <div class="product-image">
           <img :src="image" :alt="altText"/>
       </div>

       <div class="product-info">
           <h1>{{ title }}</h1>
           <p v-if="inStock">In stock</p>
           <p v-else>Out of Stock</p>
           <ul>
               <li v-for="detail in details">{{ detail }}</li>
           </ul>
           <div
                   class="color-box"
                   v-for="(variant, index) in variants"
                   :key="variant.variantId"
                   :style="{ backgroundColor:variant.variantColor }"
                   @mouseover="updateProduct(index)"
           ></div>

           <button
                   v-on:click="addToCart"
                   :disabled="!inStock"
                   :class="{ disabledButton: !inStock }"
           >
               Add to cart
           </button>
              <button
                   v-on:click="deleteFromCart"
                   :disabled="!inStock"
                   :class="{ disabledButton: !inStock }"
           >
               Delete from cart
           </button>
       </div>
<product-tabs :reviews="reviews"></product-tabs>
   </div>
 `,
    data() {
        return {
            reviews: [],
            product: "Socks",
            brand: 'Vue Mastery',
            selectedVariant: 0,
            altText: "A pair of socks",
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'Green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10
                },
                {
                    variantId: 2235,
                    variantColor: 'Blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 20
                }
            ],
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart',this.brand, this.product, this.variants[this.selectedVariant].variantColor);
        },
        deleteFromCart() {
            this.$emit('delete-from-cart', this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },
        addReview(productReview) {
            this.reviews.push(productReview)
        }

    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return 2.99
            }
        }
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    }

})
Vue.component('product-review', {
    template: `<form class="review-form" @submit.prevent="onSubmit">
<p v-if="errors.length">
 <b>Please correct the following error(s):</b>
 <ul>
   <li v-for="error in errors">{{ error }}</li>
 </ul>
</p>
 <p>
   <label for="name">Name:</label>
   <input id="name" v-model="name" placeholder="name">
 </p>

 <p>
   <label for="review">Review:</label>
   <textarea id="review" v-model="review"></textarea>
 </p>

 <p>
   <label for="rating">Rating:</label>
   <select id="rating" v-model.number="rating">
     <option>5</option>
     <option>4</option>
     <option>3</option>
     <option>2</option>
     <option>1</option>
   </select>
 </p>
  <legend>Would you recommend this product?</legend>

  <div class="question">
    <input type="radio" id="answer" name="answer" value="yes" checked v-model="answer" />
    <label for="answer">Yes</label>
  </div>

  <div class="question"> 
    <input type="radio" id="answer1" name="answer" value="no" v-model="answer" />
    <label for="answer1">no</label>
  </div>

 <p>
   <input @click="updateErrors" type="submit" value="Submit"> 
 </p>

</form>

 `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            answer: null,
            errors: []
        }
    },
    methods:{
        onSubmit() {
            if(this.name && this.review && this.rating && this.answer) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    answer: this.answer,
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.answer = null
            } else {
                if(!this.name) this.errors.push("Name required.")
                if(!this.review) this.errors.push("Review required.")
                if(!this.rating) this.errors.push("Rating required.")
                if(!this.answer) this.errors.push("Answer required.")
            }
            },
        updateErrors() {
            this.errors = []
        }

    },
})

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false
        }
    },

    template: `
    <div>  
       <ul>
         <span class="tab"
               :class="{ activeTab: selectedTab === tab }"
               v-for="(tab, index) in tabs"
               @click="selectedTab = tab"
         >{{ tab }}</span>
       </ul>
       <div v-show="selectedTab === 'Reviews'">
         <p v-if="!reviews.length">There are no reviews yet.</p>
          <button class="buttrev" @click="sortedReviews">Отсортировать А-я(A-z)</button>
          <button class="buttrev" @click="sortedReviewsRewerse">Отсортировать Я-а(Z-a)</button>  
         <ul>
           <li v-for="review in reviews">
           <p>{{ review.name }}</p>
           <p>Rating: {{ review.rating }}</p>
           <p>{{ review.review }}</p>
           </li>
         </ul>
       </div>
       <div v-show="selectedTab === 'Make a Review'">
         <product-review></product-review>
       </div>
       <div v-show="selectedTab === 'Details'">
         <product-details></product-details>
       </div>
       <div v-show="selectedTab === 'Shipping'">
         <product-shipping></product-shipping>
       </div>
       
     </div>



 `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review', 'Details', 'Shipping'],
            selectedTab: 'Reviews'  // устанавливается с помощью @click
        }
    },
    methods: {
        sortedReviews() {
            this.reviews.sort((a, b) => a.name.localeCompare(b.name));
        },
        sortedReviewsRewerse() {
            this.reviews.sort((a, b) => b.name.localeCompare(a.name));
        },
    },
})

Vue.component('product-details', {
    props: {
        reviews: {
            type: Array,
            required: false
        }
    },

    template: `
<ul>
   <li v-for="detail in details">{{ detail }}</li>
</ul>
 `,
    data() {
        return {
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
        }
    }
})

Vue.component('product-shipping', {
    props: {
        reviews: {
            type: Array,
            required: false
        }
    },

    template: `
  <p>Shipping: {{ shipping }}</p>
 `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review'],
            selectedTab: 'Reviews'  // устанавливается с помощью @click
        }
    },
    computed: {
        shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return 2.99
            }
        }
    }
})





let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart(variantColor, brand, product) {
            this.cart.push(product  + ' ' + brand + ' , ' + variantColor)

        },
        updateCartDel(id) {
            this.cart.shift(id);
        }
    }

})
