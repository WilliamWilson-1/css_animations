window.onload = () => {

    const {createApp, ref, onMounted} = Vue

    createApp({
        setup() {

            let data = catalogue
            const content = ref([])

            function init() {

            }
            function tableData(x, n = 5) {
                let r = []
                let t = []
                x.forEach((k, i) => {
                    t.push(k)
                    if ((i + 1) % n === 0 || i === x.length - 1) {
                        r.push(t)
                        t = []
                    }
                })
                return r
            }
            onMounted(() => {
                init()
            })

            return {
                data,tableData
            }
        }
    }).mount('#app')
}