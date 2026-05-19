"use client";

import defaultAvatar from "@/assets/default-avatar.png";
import defaultPostImage from "@/assets/default-post-image.png";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePostLast7DaysViewStats } from "@/hooks/use-post-view-stats";
import { toBackendImageUrl } from "@/lib/image-url";
import { formatTimeAgo } from "@/lib/time";
import type { Post, PostViewStat } from "@/types";
import {
  BarChart3,
  Eye,
  Heart,
  type LucideIcon,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function getPostImageUrls(post: Post) {
  const imageUrls = [
    ...(post.images?.map((image) => image.url) ?? []),
    post.image,
    ...(post.image_urls ?? []),
  ]
    .filter((url): url is string => Boolean(url))
    .map(toBackendImageUrl);

  return Array.from(new Set(imageUrls));
}

function formatChartDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return date;

  return new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  })
    .format(parsedDate)
    .replace(". ", "-")
    .replace(".", "");
}

function formatPreviewDate(date: string | Date) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return formatTimeAgo(date);

  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
  }).format(parsedDate);
}

function toChartData(stats: PostViewStat[]) {
  return [...stats]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((stat) => ({
      date: formatChartDate(stat.date),
      views: stat.snapshotViewCount ?? 0,
    }));
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <div className="mt-2 text-2xl font-bold tracking-normal md:text-3xl">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

export default function PostAnalyticsDialog({ post }: { post: Post }) {
  const [open, setOpen] = useState(false);
  const { data: stats = [], isPending } = usePostLast7DaysViewStats(
    post.id,
    open,
  );
  const chartData = useMemo(() => toChartData(stats), [stats]);
  const latestWeeklyViewCount = chartData.at(-1)?.views ?? 0;
  const author = post.author ?? {
    id: post.authorId,
    nickname: "알 수 없는 사용자",
    avatarUrl: null,
    avatar_url: null,
  };
  const avatarUrl = author.avatarUrl || author.avatar_url || defaultAvatar.src;
  const thumbnailUrl = getPostImageUrls(post).at(0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-xl">
          <BarChart3 className="h-4 w-4" />
          통계
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="text-xl font-bold">
            게시물 애널리틱스
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 px-5 pb-6">
          <article className="rounded-2xl border p-4">
            <div className="flex gap-3">
              <img
                src={avatarUrl ? toBackendImageUrl(avatarUrl) : defaultAvatar.src}
                alt={`${author.nickname} 프로필 이미지`}
                className="h-9 w-9 rounded-full object-cover"
                onError={(event) => {
                  event.currentTarget.src = defaultAvatar.src;
                }}
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-1 text-sm">
                  <span className="font-bold">{author.nickname}</span>
                  <span className="text-muted-foreground">
                    · {formatPreviewDate(post.created_at)}
                  </span>
                </div>

                <div className="mt-2 flex gap-3">
                  {thumbnailUrl && (
                    <img
                      src={thumbnailUrl || defaultPostImage.src}
                      alt="게시글 이미지 썸네일"
                      className="h-24 w-24 shrink-0 rounded-lg border object-cover"
                      onError={(event) => {
                        event.currentTarget.src = defaultPostImage.src;
                      }}
                    />
                  )}
                  <p className="line-clamp-5 whitespace-pre-wrap text-sm leading-6">
                    {post.content}
                  </p>
                </div>
              </div>
            </div>
          </article>

          <section className="grid gap-3 sm:grid-cols-3">
            <MetricCard
              label="조회수"
              value={post.viewCount ?? 0}
              icon={Eye}
            />
            <MetricCard
              label="최근 일주일 조회수"
              value={latestWeeklyViewCount}
              icon={TrendingUp}
            />
            <MetricCard
              label="좋아요 수"
              value={post.likeCount ?? 0}
              icon={Heart}
            />
          </section>

          <section className="rounded-2xl border p-4">
            <div className="mb-4 flex items-center gap-2">
              <Eye className="text-muted-foreground h-4 w-4" />
              <h3 className="font-bold">최근 7일 조회수</h3>
            </div>

            {isPending ? (
              <div className="text-muted-foreground flex h-56 items-center justify-center text-sm">
                통계 데이터를 불러오는 중...
              </div>
            ) : chartData.length === 0 ? (
              <div className="text-muted-foreground flex h-56 items-center justify-center text-sm">
                아직 통계 데이터가 없습니다.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      width={36}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--muted)" }}
                      formatter={(value) => [
                        Number(value).toLocaleString(),
                        "조회수",
                      ]}
                    />
                    <Bar
                      dataKey="views"
                      fill="var(--foreground)"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={42}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
