const STORAGE_KEY = 'BOOK-MARKS';
const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
let myStorage = {
    fetch: function () {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    },
    save: function (bookmarks) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks))
    }
};

Vue.component('modal', {
    template: '#modal-template',
    data() {
        return {
            bookTitle: '',
            bookNowPage: null,
            bookTotalPage: null,
            ErrorMsg: ''
        }
    }, methods: {
        testLegal() {
            let areNum = parseInt(this.bookNowPage) && parseInt(this.bookTotalPage);

            if (!areNum) {
                this.ErrorMsg = 'Not numbers';
                return false
            }

            let areSmaller = this.bookTotalPage >= this.bookNowPage;

            if (!areSmaller) {
                this.ErrorMsg = 'Now page number is bigger than the Total Pages number';
                return false
            }
            return true
        },
        cancel() {
            this.$emit('pure-close')
        },
        close() {
            if (this.testLegal()) {
                this.$emit('close', {
                    bookTitle: this.bookTitle,
                    bookNowPage: this.bookNowPage,
                    bookTotalPage: this.bookTotalPage,
                    bookStartReading: new Date().toISOString().split('T')[0]
                })
            }
        }
    }
});


Vue.component('book', {
    template: '#book-template',
    props: ['bookData', 'bookId']
    , data() {
        return {
            number: this.bookData.bookNowPage,
            tweenedNumber: 0,
            isOpen: false,
            showBookmarkContent: false,
        }
    },
    computed: {
        percentage() {
            return Math.round(this.bookData.bookNowPage / this.bookData.bookTotalPage * 1000) / 10 + ' %'
        },
        animatedNumber() {
            return this.tweenedNumber.toFixed(0);
        }
    }, watch: {
        number: function (newValue) {
            TweenLite.to(this.$data, 1, {tweenedNumber: newValue});
        }
    },
    methods: {
        showEffect() {
            //console.log(this.isOpen);
            //let selectedPages = this.$el;
            //console.log(selectedPages);
            let showList = (this.isOpen ? [0, 1, 2, 3] : [3, 2, 1, 0] );;
            if (isChrome){
                //showList = (this.isOpen ? [0, 1, 2, 3] : [3, 2, 1, 0] );
            }else{
                //showList = (this.isOpen ? [3, 2, 1, 0] : [0, 1, 2, 3]);
            }
            //let showList = [3, 2, 1, 0];
            let pageList = Array.from(this.$el.getElementsByClassName('turn'));
            pageList.forEach((page, index) => {
                setTimeout(() => {
                    page.style.zIndex = 100 * (showList[index] + 1) + '';
                    setTimeout(() => page.classList.toggle('open'), 100);
                }, 100 * showList[index] + 100)
            })
        },
        moveBookmark(time) {

            setTimeout(() => {
                //let selectedPages = document.getElementsByClassName('book-0')[0];
                //console.log(selectedPages);
                this.$el.getElementsByClassName('bookmark')[0].classList.toggle('show-bookmark');
            }, time);
            //console.log(this.showBookmarkContent);
        },
        putBackBookmark() {
            this.showBookmarkContent = !this.showBookmarkContent;
            this.moveBookmark(0);
        },
        takeOutBookmark() {
            this.moveBookmark(1000);
            setTimeout(() => {
                console.log(this.showBookmarkContent);
                this.showBookmarkContent = !this.showBookmarkContent;
                console.log(this.showBookmarkContent);
                this.number = this.bookData.bookNowPage
            }, 2000)
        },
        closeBook() {
            this.putBackBookmark();
            //setTimeout(()=>{
            this.showEffect();
            //document.getElementById('lastPage').click();
            this.$emit('close', this.bookId);
            //},500);
        },
        openBook() {
            this.showEffect();
            this.takeOutBookmark();
            this.$emit('open', this.bookId);
        },
        toggleOpen() {
            if (this.isOpen) {
                this.closeBook();
            } else {
                this.openBook();
                console.log(this.$data)
            }
            this.isOpen = !this.isOpen;
            this.number = 0;
        }
    }, updated() {
        this.number = this.bookData.bookNowPage
    }
});

let main = new Vue({
    el: '#main',
    data: {
        showModal: false,
        showBookDetail: false,
        changeView: true,
        inputNum: '',
        selectedBookNo: null,
        ErrorMsg: '',
        books: myStorage.fetch(),
        showBooks: []
    }, watch: {
        books: {
            handler: function (mybooks) {
                myStorage.save(mybooks);

            },
            deep: true
        }
    }, methods: {
        hideOtherBooks(bookId) {
            this.selectedBookNo = bookId;
            this.changeView = !this.changeView;
            //console.log(bookId);
            //let cache = this.books[bookId];
            console.log(this.showBooks);
            console.log(bookId);
            this.showBooks.slice(bookId, 1);
            //this.showBooks.push(cache);

            //console.log(this.showBooks)
        },
        closeByButton() {
            document.getElementById('lastPage').click();
        },
        showOtherBooks() {
            this.selectedBookNo = null;
            this.changeView = !this.changeView;
            document.getElementsByTagName('html')[0].classList.toggle('fix');
            this.showBooks.splice(0);
            this.showBooks = this.showBooks.concat(this.books);
        },
        checkNum() {
            let Num = parseInt(this.inputNum);
            let bookRecord = this.books[this.selectedBookNo];
            if (Num) {
                bookRecord.bookNowPage = Num;
                this.$set(this.books, this.selectedBookNo, bookRecord);
                this.inputNum = ''
            } else {
                this.ErrorMsg = '  Not a Number';
                setTimeout(() => (this.ErrorMsg = ''), 2000)
            }
            console.log(this.books)
        },
        showAddBook() {
            this.showModal = true
        },
        pureCloseAddBook() {
            this.showModal = false;
        },
        closeAddBook(bookData) {
            this.showModal = false;
            this.books.push(bookData);
            this.showBooks.push(bookData);
            //console.log(this.books)
        },
        deleteAll() {
            console.log('21edcq');
            this.books.splice(0);
            this.showBooks.splice(0);
        }
    }, created() {
        this.showBooks = this.showBooks.concat(this.books);
    }
});