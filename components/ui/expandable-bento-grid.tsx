'use client'

import React, { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useOutsideClick } from '@/hooks/use-outside-click'
import { X } from 'lucide-react'

export interface BentoGridProps {
    items: {
        id: string | number
        title: string
        subtitle?: string
        description?: string
        content: React.ReactNode
        icon?: React.ReactNode
        className?: string
    }[]
}

export default function ExpandableBentoGrid({ items }: BentoGridProps) {
    const [active, setActive] = useState<(typeof items)[number] | boolean | null>(null)
    const ref = useRef<HTMLDivElement>(null)
    const id = useId()

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setActive(false)
            }
        }

        if (active && typeof active === 'object') {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }

        window.addEventListener('keydown', onKeyDown)
        return () => window.removeEventListener('keydown', onKeyDown)
    }, [active])

    useOutsideClick(ref, () => setActive(null))

    return (
        <>
            <AnimatePresence>
                {active && typeof active === 'object' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 h-full w-full z-[10000]"
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {active && typeof active === 'object' ? (
                    <div className=" fixed inset-0 top-16 grid place-items-center z-[10001] ">
                        <motion.button
                            key={`button-${active.title}-${id}`}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.05 } }}
                            className="flex absolute top-2 right-2 md:right-10 lg:hidden items-center justify-center rounded-full h-6 w-6"
                            style={{ backgroundColor: 'var(--bg-elevated)' }}
                            onClick={() => setActive(null)}
                        >
                            <X className="h-4 w-4" style={{ color: 'var(--text-primary)' }} />
                            
                        </motion.button>
                        <motion.div
                            layoutId={`card-${active.title}-${id}`}
                            ref={ref}
                            className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col sm:rounded-3xl overflow-hidden border"
                            style={{ backgroundColor: 'var(--bg-overlay)', borderColor: 'var(--border)' }}
                        >
                            <motion.div layoutId={`image-${active.title}-${id}`}>
                                <div className="w-full h-40 md:h-50 lg:h-60 flex items-center justify-center perspective-distant transform-3d" style={{ backgroundColor: 'var(--gold-subtle)' }}>
                                    {active.icon ? (
                                        <div className="scale-[2]" style={{ color: 'var(--gold)' }}>{active.icon}</div>
                                    ) : (
                                        <div className="w-full h-full" style={{ backgroundColor: 'var(--bg-elevated)' }} />
                                    )}
                                </div>
                            </motion.div>

                            <div >
                                <div className="flex justify-between p-4  items-center">
                                    <div className="">
                                        <motion.h3
                                            layoutId={`title-${active.title}-${id}`}
                                            className="font-bold md:text-sm"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {active.title}
                                        </motion.h3>
                                        <motion.p
                                            layoutId={`description-${active.title}-${id}`}
                                            className="text-[14px] text-balance"
                                            style={{ color: 'var(--text-secondary)' }}
                                        >
                                            {active.description}
                                        </motion.p>
                                    </div>

                                    <motion.a
                                        layoutId={`button-${active.title}-${id}`}
                                        href="#"
                                        target="_blank"
                                        className="px-4 py-3 text-sm rounded-2xl font-bold"
                                        style={{ backgroundColor: 'var(--gold)', color: 'var(--bg-base)' }}
                                    >
                                        Visit
                                    </motion.a>
                                </div>


                             
                                  <div className="pt-4  px-4  flex justify-center mx-auto overflow-auto">
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-xs md:text-sm lg:text-base h-40 md:h-fit pb-5 flex flex-col items-start gap-4 [mask:linear-gradient(to_bottom,black,black,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                                        style={{ color: 'var(--text-secondary)' }}
                                    >
                                        {active.content}
                                    </motion.div>
                                </div>
                              </div>
                          
                        </motion.div>
                    </div>
                ) : null}
            </AnimatePresence>
            <ul className="max-w-4xl mx-auto w-full gap-2 lg:gap-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  items-start ">
                {items.map((item) => (
                    <motion.div
                        layoutId={`card-${item.title}-${id}`}
                        key={item.id}
                        onClick={() => setActive(item)}
                        className="p-4 flex flex-col md:flex-row justify-between items-center rounded-xl cursor-pointer border transition-colors group"
                        style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
                    >
                        <div className="flex gap-3 flex-row items-center justify-center mx-auto ">
                            <motion.div layoutId={`image-${item.title}-${id}`}>
                                <div className="h-14 w-14 rounded-lg flex items-center justify-center p-1" style={{ backgroundColor: 'var(--gold-subtle)', color: 'var(--gold)' }}>
                                    {item.icon}
                                </div>
                            </motion.div>
                            <div className="">
                                <motion.h3
                                    layoutId={`title-${item.title}-${id}`}
                                    className="font-medium text-left"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    {item.title}
                                </motion.h3>
                                <motion.p
                                    layoutId={`description-${item.title}-${id}`}
                                    className="text-left text-xs md:text-[14px]"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    {item.subtitle}
                                </motion.p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </ul>
        </>
    )
}
