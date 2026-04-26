"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, X, Camera, Loader2, CheckCircle2, ShoppingBag } from "lucide-react"
import { reviewsApi } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/providers/AuthProvider"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: string
    name: string
    image?: string
  }
  onSuccess?: () => void
}

export function ReviewModal({ isOpen, onClose, product, onSuccess }: ReviewModalProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [orderNumber, setOrderNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  async function compressImage(file: File, maxWidth = 1500, quality = 0.8): Promise<string> {
    const blobURL = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = blobURL;
    });
    const scale = Math.min(1, maxWidth / img.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(blobURL);
    return canvas.toDataURL("image/jpeg", quality);
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const res = await fetch(compressed);
      const blob = await res.blob();
      
      const formData = new FormData();
      formData.append("file", new File([blob], file.name, { type: "image/jpeg" }));

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (uploadRes.ok) {
        const data = await uploadRes.json();
        setImageUrl(data.url);
        toast({ title: "Photo uploaded!" });
      } else {
        toast({ title: "Upload failed", variant: "destructive" });
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await reviewsApi.create({
        productId: product.id,
        rating,
        comment,
        imageUrl,
        orderNumber: !user ? orderNumber : undefined
      })

      if (res.error) {
        toast({
          title: "Error",
          description: res.error,
          variant: "destructive"
        })
      } else {
        setIsSuccess(true)
        if (onSuccess) onSuccess()
        setTimeout(() => {
          onClose()
          setIsSuccess(false)
          setRating(0)
          setComment("")
          setImageUrl("")
          setOrderNumber("")
        }, 2000)
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            {isSuccess ? (
              <div className="p-12 text-center flex flex-col items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Thank You!</h3>
                <p className="text-slate-500 font-medium">Your review has been submitted and is being processed.</p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">Rate Product</h3>
                  <button onClick={onClose} className="h-10 w-10 rounded-full hover:bg-slate-50 flex items-center justify-center transition-colors">
                    <X className="h-5 w-5 text-slate-400" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Product Info */}
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="h-16 w-16 bg-white rounded-xl overflow-hidden border border-slate-200 shrink-0">
                      <img src={product.image || "/placeholder.jpg"} alt={product.name} className="h-full w-full object-contain p-1" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 line-clamp-1 uppercase">{product.name}</h4>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-0.5">
                        {user ? "Verified Purchase" : "Share your experience"}
                      </p>
                    </div>
                  </div>

                  {/* Order Number (Only for Guest) */}
                  {!user && (
                    <div className="space-y-2">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Order Number (Optional)</p>
                      <div className="relative">
                        <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={orderNumber}
                          onChange={(e) => setOrderNumber(e.target.value)}
                          placeholder="e.g. ORD-12345"
                          className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed px-1">
                        Provide your order number to get a <span className="text-emerald-600 font-bold">Verified User</span> badge on your review.
                      </p>
                    </div>
                  )}

                  {/* Rating */}
                  <div className="text-center space-y-2">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">How would you rate it?</p>
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHover(star)}
                          onMouseLeave={() => setHover(0)}
                          className="p-1 transition-transform active:scale-90"
                        >
                          <Star
                            className={`h-8 w-8 transition-colors ${
                              (hover || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-slate-200"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Write your feedback</p>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="What did you like or dislike about this product?"
                      className="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Add a photo (Optional)</p>
                    <div className="relative">
                      {imageUrl ? (
                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 group">
                          <img src={imageUrl} alt="Review preview" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => setImageUrl("")}
                            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload}
                            className="hidden" 
                          />
                          {uploading ? (
                            <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
                          ) : (
                            <>
                              <Camera className="h-6 w-6 text-slate-300 mb-2" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload Photo</p>
                            </>
                          )}
                        </label>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || rating === 0}
                    className="w-full h-14 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Review"}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
