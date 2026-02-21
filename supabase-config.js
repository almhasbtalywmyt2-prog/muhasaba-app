// ============================================
// إعداد Supabase - قاعدة بيانات SQL السحابية
// ============================================

// استيراد المكتبة من CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// بيانات المشروع - يجب على المستخدم استبدال هذه القيم
const SUPABASE_URL = 'https://moaosdyamrorzqtekakj.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable__novwJIZbe9n8GtnUX3g-A_0FhJi47y'

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// دالة مساعدة لحفظ البيانات
export async function spSet(table, data) {
    try {
        const { error } = await supabaseClient
            .from(table)
            .insert([data])

        if (error) throw error
        console.log(`✅ تم الحفظ في ${table} بنجاح`)
    } catch (e) {
        console.error("Supabase write error:", e)
    }
}

// دالة مساعدة لجلب البيانات
export async function spGet(table) {
    try {
        const { data, error } = await supabaseClient
            .from(table)
            .select('*')

        if (error) throw error
        return data
    } catch (e) {
        console.error("Supabase read error:", e)
        return []
    }
}
